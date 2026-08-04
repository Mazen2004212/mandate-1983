begin;

select plan(34);

insert into auth.users (id, aud, role, email)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'authenticated', 'authenticated', 'task11-a@example.test'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'authenticated', 'authenticated', 'task11-b@example.test');

select ok(
  not has_table_privilege('authenticated', 'public.saves', 'SELECT'),
  'authenticated has no direct authoritative-save read grant'
);
select ok(
  not has_table_privilege('authenticated', 'public.saves', 'INSERT'),
  'authenticated has no direct authoritative-save insert grant'
);
select ok(
  not has_table_privilege('authenticated', 'public.saves', 'UPDATE'),
  'authenticated has no direct authoritative-save update grant'
);
select ok(
  not has_table_privilege('authenticated', 'public.saves', 'DELETE'),
  'authenticated has no direct authoritative-save delete grant'
);
select ok(
  not has_table_privilege('authenticated', 'public.mutation_history', 'SELECT'),
  'authenticated has no direct receipt read grant'
);
select ok(
  not has_table_privilege('authenticated', 'public.mutation_history', 'INSERT'),
  'authenticated has no direct receipt insert grant'
);

select ok(
  has_function_privilege(
    'authenticated',
    'mandate_private.commit_owned_mutation(uuid,bigint,bigint,smallint,text,jsonb,jsonb,timestamptz,text,text,timestamptz,jsonb)',
    'EXECUTE'
  ),
  'authenticated server sessions have the one explicit commit-function grant'
);
select ok(
  not has_function_privilege(
    'anon',
    'mandate_private.commit_owned_mutation(uuid,bigint,bigint,smallint,text,jsonb,jsonb,timestamptz,text,text,timestamptz,jsonb)',
    'EXECUTE'
  ),
  'anonymous sessions cannot execute the commit function'
);
select ok(
  not has_function_privilege(
    'service_role',
    'mandate_private.commit_owned_mutation(uuid,bigint,bigint,smallint,text,jsonb,jsonb,timestamptz,text,text,timestamptz,jsonb)',
    'EXECUTE'
  ),
  'service_role receives no TASK-11 commit-function grant'
);
select results_eq(
  $$select count(*)::integer
    from information_schema.routine_privileges
    where specific_schema = 'mandate_private'
      and grantee = 'authenticated'
      and privilege_type = 'EXECUTE'$$,
  array[7],
  'only the seven reviewed repository functions are executable by authenticated server sessions'
);
select results_eq(
  $$select count(*)::integer
    from information_schema.routine_privileges
    where specific_schema = 'mandate_private'
      and grantee = 'anon'
      and privilege_type = 'EXECUTE'$$,
  array[0],
  'anonymous sessions have no private-function execute grant'
);
select results_eq(
  $$select count(*)::integer
    from information_schema.routine_privileges
    where specific_schema = 'mandate_private'
      and grantee = 'service_role'
      and privilege_type = 'EXECUTE'$$,
  array[0],
  'service-role sessions have no private-function execute grant'
);
select results_eq(
  $$select count(*)::integer
    from information_schema.parameters
    where specific_schema = 'mandate_private'
      and specific_name like 'create_owned_save%'
      and parameter_name = 'p_owner_id'$$,
  array[0],
  'create function accepts no arbitrary owner identity'
);

select results_eq(
  $$select count(*)::integer
    from pg_proc as p
    join pg_namespace as n on n.oid = p.pronamespace
    where n.nspname = 'mandate_private'
      and p.proname in (
        'create_owned_save',
        'read_owned_save',
        'list_owned_saves',
        'delete_owned_save',
        'lock_owned_save_for_mutation',
        'read_owned_mutation_receipt',
        'commit_owned_mutation'
      )
      and p.prosecdef
      and exists (
        select 1 from unnest(coalesce(p.proconfig, array[]::text[])) as setting
        where setting in ('search_path=', 'search_path=""')
      )$$,
  array[7],
  'all seven repository functions are SECURITY DEFINER with an empty search path'
);

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select throws_ok(
  $$select * from mandate_private.read_owned_save('11111111-1111-4111-8111-111111111111')$$,
  '42501',
  'permission denied for schema mandate_private',
  'anonymous users cannot call the private repository schema'
);

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}',
  true
);

select lives_ok(
  $sql$
    select mandate_private.create_owned_save(
      '11111111-1111-4111-8111-111111111111'::uuid,
      'save-1.0.0', 'mvp-0.1.0', 'schema-1.0.0', 0::bigint,
      'task_11_seed_value_0001', 0::smallint, 'security_committee_chair',
      '{"surname":"Varen"}'::jsonb,
      '{"timeline":{"politicalPeriod":0},"identity":{"selectedBackground":"security_committee_chair","familyIdentity":{"surname":"Varen"}},"eventHistory":[]}'::jsonb,
      '1983-01-01T00:00:00Z'::timestamptz, '1983-01-01T00:00:00Z'::timestamptz
    )
  $sql$,
  'authenticated server session creates a save whose owner comes from auth.uid'
);
select results_eq(
  $$select owner_id from mandate_private.read_owned_save('11111111-1111-4111-8111-111111111111')$$,
  array['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid],
  'the created save belongs to the authenticated actor'
);

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","role":"authenticated"}',
  true
);
select is_empty(
  $$select * from mandate_private.read_owned_save('11111111-1111-4111-8111-111111111111')$$,
  'a different user cannot read the save through the private function'
);
select is_empty(
  $$select * from mandate_private.list_owned_saves()$$,
  'a different user cannot discover the save through the private list function'
);
select is_empty(
  $$select * from mandate_private.lock_owned_save_for_mutation('11111111-1111-4111-8111-111111111111')$$,
  'a different user cannot lock the save through the private function'
);
select is_empty(
  $$select * from mandate_private.read_owned_mutation_receipt('11111111-1111-4111-8111-111111111111', 'unavailable')$$,
  'a different user cannot read receipts through the private function'
);
select is(
  mandate_private.delete_owned_save('11111111-1111-4111-8111-111111111111'),
  false,
  'a different user cannot delete the save through the private function'
);
select throws_ok(
  $sql$
    select mandate_private.commit_owned_mutation(
      '11111111-1111-4111-8111-111111111111'::uuid, 0::bigint, 1::bigint, 0::smallint,
      'security_committee_chair', '{"surname":"Varen"}'::jsonb,
      '{}'::jsonb, '1983-01-02T00:00:00Z'::timestamptz, 'cross_user',
      'choice_resolution', '1983-01-02T00:00:00Z'::timestamptz, '{}'::jsonb
    )
  $sql$,
  '42501',
  'owned save not found',
  'the commit function rechecks auth.uid ownership internally'
);

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}',
  true
);

select lives_ok(
  $sql$
    select mandate_private.commit_owned_mutation(
      '11111111-1111-4111-8111-111111111111'::uuid, 0::bigint, 1::bigint, 0::smallint,
      'security_committee_chair', '{"surname":"Varen"}'::jsonb,
      '{"timeline":{"politicalPeriod":0},"identity":{"selectedBackground":"security_committee_chair","familyIdentity":{"surname":"Varen"}},"eventHistory":[{"type":"choice_resolution","idempotencyKey":"choice_ok","scenarioId":"scenario_alpha","choiceId":"choice_alpha","expectedRevision":0,"resultingRevision":1,"politicalPeriod":0,"resolvedAt":"1983-01-02T00:00:00.000Z","appliedEffectIds":[],"createdMemoryIds":[],"addedFlagIds":[],"removedFlagIds":[],"scheduledDelayedEffectIds":[],"scheduledMediaIds":[]}]}'::jsonb,
      '1983-01-02T00:00:00Z'::timestamptz, 'choice_ok', 'choice_resolution',
      '1983-01-02T00:00:00Z'::timestamptz,
      '{"type":"choice_resolution","idempotencyKey":"choice_ok","scenarioId":"scenario_alpha","choiceId":"choice_alpha","expectedRevision":0,"resultingRevision":1,"politicalPeriod":0,"resolvedAt":"1983-01-02T00:00:00.000Z","appliedEffectIds":[],"createdMemoryIds":[],"addedFlagIds":[],"removedFlagIds":[],"scheduledDelayedEffectIds":[],"scheduledMediaIds":[]}'::jsonb
    )
  $sql$,
  'the private compare-and-swap function commits save and receipt together'
);
select results_eq(
  $$select revision::integer from mandate_private.read_owned_save('11111111-1111-4111-8111-111111111111')$$,
  array[1],
  'accepted mutation increments revision exactly once'
);
select results_eq(
  $$select count(*)::integer from mandate_private.read_owned_mutation_receipt('11111111-1111-4111-8111-111111111111', 'choice_ok')$$,
  array[1],
  'accepted mutation has exactly one normalized receipt'
);

select lives_ok(
  $sql$
    select mandate_private.create_owned_save(
      '22222222-2222-4222-8222-222222222222'::uuid,
      'save-1.0.0', 'mvp-0.1.0', 'schema-1.0.0', 0::bigint,
      'task_11_seed_value_0002', 0::smallint, 'civil_service_reformer',
      '{"surname":"Varen"}'::jsonb,
      '{"timeline":{"politicalPeriod":0},"identity":{"selectedBackground":"civil_service_reformer","familyIdentity":{"surname":"Varen"}},"eventHistory":[]}'::jsonb,
      '1983-01-01T00:00:00Z'::timestamptz, '1983-01-01T00:00:00Z'::timestamptz
    )
  $sql$,
  'receipt-failure rollback fixture is created'
);
select throws_ok(
  $sql$
    select mandate_private.commit_owned_mutation(
      '22222222-2222-4222-8222-222222222222'::uuid, 0::bigint, 1::bigint, 0::smallint,
      'civil_service_reformer', '{"surname":"Varen"}'::jsonb,
      '{"timeline":{"politicalPeriod":0},"identity":{"selectedBackground":"civil_service_reformer","familyIdentity":{"surname":"Varen"}},"eventHistory":[{"type":"unknown","idempotencyKey":"receipt_failure","expectedRevision":0,"resultingRevision":1}]}'::jsonb,
      '1983-01-02T00:00:00Z'::timestamptz, 'receipt_failure', 'unknown',
      '1983-01-02T00:00:00Z'::timestamptz,
      '{"type":"unknown","idempotencyKey":"receipt_failure","expectedRevision":0,"resultingRevision":1}'::jsonb
    )
  $sql$,
  '23514',
  'new row for relation "mutation_history" violates check constraint "mutation_history_receipt_variant_metadata"',
  'receipt constraint failure aborts the atomic commit'
);
select results_eq(
  $$select revision::integer from mandate_private.read_owned_save('22222222-2222-4222-8222-222222222222')$$,
  array[0],
  'receipt failure rolls the save update back'
);
select is_empty(
  $$select * from mandate_private.read_owned_mutation_receipt('22222222-2222-4222-8222-222222222222', 'receipt_failure')$$,
  'receipt failure leaves no audit row'
);

select lives_ok(
  $sql$
    select mandate_private.create_owned_save(
      '33333333-3333-4333-8333-333333333333'::uuid,
      'save-1.0.0', 'mvp-0.1.0', 'schema-1.0.0', 0::bigint,
      'task_11_seed_value_0003', 0::smallint, 'civil_service_reformer',
      '{"surname":"Varen"}'::jsonb,
      '{"timeline":{"politicalPeriod":0},"identity":{"selectedBackground":"civil_service_reformer","familyIdentity":{"surname":"Varen"}},"eventHistory":[]}'::jsonb,
      '1983-01-01T00:00:00Z'::timestamptz, '1983-01-01T00:00:00Z'::timestamptz
    )
  $sql$,
  'save-failure rollback fixture is created'
);
select throws_ok(
  $sql$
    select mandate_private.commit_owned_mutation(
      '33333333-3333-4333-8333-333333333333'::uuid, 0::bigint, 1::bigint, 1::smallint,
      'civil_service_reformer', '{"surname":"Varen"}'::jsonb,
      '{"timeline":{"politicalPeriod":0},"identity":{"selectedBackground":"civil_service_reformer","familyIdentity":{"surname":"Varen"}},"eventHistory":[{"type":"choice_resolution","idempotencyKey":"save_failure","scenarioId":"scenario_alpha","choiceId":"choice_alpha","expectedRevision":0,"resultingRevision":1,"politicalPeriod":0,"resolvedAt":"1983-01-02T00:00:00.000Z","appliedEffectIds":[],"createdMemoryIds":[],"addedFlagIds":[],"removedFlagIds":[],"scheduledDelayedEffectIds":[],"scheduledMediaIds":[]}]}'::jsonb,
      '1983-01-02T00:00:00Z'::timestamptz, 'save_failure', 'choice_resolution',
      '1983-01-02T00:00:00Z'::timestamptz,
      '{"type":"choice_resolution","idempotencyKey":"save_failure","scenarioId":"scenario_alpha","choiceId":"choice_alpha","expectedRevision":0,"resultingRevision":1,"politicalPeriod":0,"resolvedAt":"1983-01-02T00:00:00.000Z","appliedEffectIds":[],"createdMemoryIds":[],"addedFlagIds":[],"removedFlagIds":[],"scheduledDelayedEffectIds":[],"scheduledMediaIds":[]}'::jsonb
    )
  $sql$,
  '23514',
  'new row for relation "saves" violates check constraint "saves_period_metadata_consistent"',
  'save constraint failure aborts before a receipt can persist'
);
select results_eq(
  $$select revision::integer from mandate_private.read_owned_save('33333333-3333-4333-8333-333333333333')$$,
  array[0],
  'save-write failure keeps the prior revision'
);
select is_empty(
  $$select * from mandate_private.read_owned_mutation_receipt('33333333-3333-4333-8333-333333333333', 'save_failure')$$,
  'save-write failure leaves no receipt'
);

select * from finish();
rollback;
