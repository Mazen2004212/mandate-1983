begin;

select no_plan();

insert into auth.users (id, aud, role, email)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'authenticated', 'authenticated', 'user-a@example.test'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'authenticated', 'authenticated', 'user-b@example.test');

select results_eq(
  $$select count(*)::integer from public.profiles$$,
  array[2],
  'the auth trigger creates exactly one profile for each user'
);

select throws_ok(
  $$insert into public.profiles (user_id) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')$$,
  '23505',
  'duplicate key value violates unique constraint "profiles_pkey"',
  'duplicate profiles are rejected'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}',
  true
);

select results_eq(
  $$select count(*)::integer from public.profiles where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  array[1],
  'user A can read their own profile'
);

select results_eq(
  $$select count(*)::integer from public.profiles where user_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'$$,
  array[0],
  'user A cannot read user B profile'
);

select lives_ok(
  $$update public.profiles set updated_at = statement_timestamp() where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  'user A can update the permitted field on their own profile'
);

select results_eq(
  $$with changed as (
      update public.profiles
      set updated_at = statement_timestamp()
      where user_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
      returning 1
    ) select count(*)::integer from changed$$,
  array[0],
  'user A cannot update user B profile'
);

select throws_ok(
  $$update public.profiles set user_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  '42501',
  'permission denied for table profiles',
  'profile ownership cannot be modified'
);

select throws_ok(
  $sql$
    insert into public.saves (
      save_id, owner_id, save_version, content_version, schema_version,
      revision, game_seed, political_period, selected_background,
      family_identity, authoritative_state
    ) values (
      '11111111-1111-4111-8111-111111111111',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'save-1.0.0', 'mvp-0.1.0', 'schema-1.0.0', 0,
      'task_10_seed_value_0001', 0, 'civil_service_reformer',
      '{"surname":"Varen"}'::jsonb,
      '{"timeline":{"politicalPeriod":0},"identity":{"selectedBackground":"civil_service_reformer","familyIdentity":{"surname":"Varen"}}}'::jsonb
    )
  $sql$,
  '42501',
  'permission denied for table saves',
  'authenticated clients cannot insert authoritative saves directly after TASK-11'
);

select throws_ok(
  $$select * from public.saves where save_id = '11111111-1111-4111-8111-111111111111'$$,
  '42501',
  'permission denied for table saves',
  'authenticated clients cannot read hidden authoritative saves directly after TASK-11'
);

select throws_ok(
  $$update public.saves set updated_at = statement_timestamp() where save_id = '11111111-1111-4111-8111-111111111111'$$,
  '42501',
  'permission denied for table saves',
  'authenticated clients cannot update save timestamps directly after TASK-11'
);

select throws_ok(
  $$update public.saves set owner_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' where save_id = '11111111-1111-4111-8111-111111111111'$$,
  '42501',
  'permission denied for table saves',
  'user A cannot transfer save ownership'
);

reset role;

insert into public.saves (
  save_id, owner_id, save_version, content_version, schema_version,
  revision, game_seed, political_period, selected_background,
  family_identity, authoritative_state
) values (
  '11111111-1111-4111-8111-111111111111',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'save-1.0.0', 'mvp-0.1.0', 'schema-1.0.0', 0,
  'task_10_seed_value_0001', 0, 'civil_service_reformer',
  '{"surname":"Varen"}'::jsonb,
  '{"timeline":{"politicalPeriod":0},"identity":{"selectedBackground":"civil_service_reformer","familyIdentity":{"surname":"Varen"}}}'::jsonb
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","role":"authenticated"}',
  true
);

select throws_ok(
  $$select * from public.saves where save_id = '11111111-1111-4111-8111-111111111111'$$,
  '42501',
  'permission denied for table saves',
  'user B cannot directly read user A save'
);

select throws_ok(
  $sql$
    insert into public.saves (
      save_id, owner_id, save_version, content_version, schema_version,
      revision, game_seed, political_period, selected_background,
      family_identity, authoritative_state
    ) values (
      '22222222-2222-4222-8222-222222222222',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'save-1.0.0', 'mvp-0.1.0', 'schema-1.0.0', 0,
      'task_10_seed_value_0002', 0, 'civil_service_reformer',
      '{"surname":"Varen"}'::jsonb,
      '{"timeline":{"politicalPeriod":0},"identity":{"selectedBackground":"civil_service_reformer","familyIdentity":{"surname":"Varen"}}}'::jsonb
    )
  $sql$,
  '42501',
  'permission denied for table saves',
  'user B cannot directly forge user A ownership on insert'
);

select throws_ok(
  $$update public.saves set updated_at = statement_timestamp() where save_id = '11111111-1111-4111-8111-111111111111'$$,
  '42501',
  'permission denied for table saves',
  'user B cannot directly update user A save'
);

select throws_ok(
  $$delete from public.saves where save_id = '11111111-1111-4111-8111-111111111111'$$,
  '42501',
  'permission denied for table saves',
  'user B cannot directly delete user A save'
);

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select throws_ok(
  $$select * from public.profiles$$,
  '42501',
  'permission denied for table profiles',
  'anonymous profile reads are denied by grants'
);
select throws_ok(
  $$select * from public.saves$$,
  '42501',
  'permission denied for table saves',
  'anonymous save reads are denied by grants'
);
select throws_ok(
  $sql$
    insert into public.saves (
      save_id, owner_id, save_version, content_version, schema_version,
      revision, game_seed, political_period, selected_background,
      family_identity, authoritative_state
    ) values (
      '33333333-3333-4333-8333-333333333333',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'save-1.0.0', 'mvp-0.1.0', 'schema-1.0.0', 0,
      'task_10_seed_value_0003', 0, 'civil_service_reformer',
      '{"surname":"Varen"}'::jsonb,
      '{"timeline":{"politicalPeriod":0},"identity":{"selectedBackground":"civil_service_reformer","familyIdentity":{"surname":"Varen"}}}'::jsonb
    )
  $sql$,
  '42501',
  'permission denied for table saves',
  'anonymous save inserts are denied by grants'
);
select throws_ok(
  $$update public.saves set updated_at = statement_timestamp()$$,
  '42501',
  'permission denied for table saves',
  'anonymous save updates are denied by grants'
);
select throws_ok(
  $$delete from public.saves$$,
  '42501',
  'permission denied for table saves',
  'anonymous save deletes are denied by grants'
);

reset role;

select throws_ok(
  $sql$
    insert into public.saves (
      save_id, owner_id, save_version, content_version, schema_version,
      revision, game_seed, political_period, selected_background,
      family_identity, authoritative_state
    ) values (
      '44444444-4444-4444-8444-444444444444',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'save-1.0.0', 'mvp-0.1.0', 'schema-1.0.0', -1,
      'task_10_seed_value_0004', 0, 'civil_service_reformer',
      '{"surname":"Varen"}'::jsonb,
      '{"timeline":{"politicalPeriod":0},"identity":{"selectedBackground":"civil_service_reformer","familyIdentity":{"surname":"Varen"}}}'::jsonb
    )
  $sql$,
  '23514',
  'new row for relation "saves" violates check constraint "saves_revision_range"',
  'negative save revisions are rejected'
);

select throws_ok(
  $sql$
    insert into public.saves (
      save_id, owner_id, save_version, content_version, schema_version,
      revision, game_seed, political_period, selected_background,
      family_identity, authoritative_state
    ) values (
      '55555555-5555-4555-8555-555555555555',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'save-1.0.0', 'mvp-0.1.0', 'schema-1.0.0', 0,
      'task_10_seed_value_0005', 7, 'civil_service_reformer',
      '{"surname":"Varen"}'::jsonb,
      '{"timeline":{"politicalPeriod":7},"identity":{"selectedBackground":"civil_service_reformer","familyIdentity":{"surname":"Varen"}}}'::jsonb
    )
  $sql$,
  '23514',
  'new row for relation "saves" violates check constraint "saves_political_period_range"',
  'out-of-range political periods are rejected'
);

select throws_ok(
  $sql$
    insert into public.saves (
      save_id, owner_id, save_version, content_version, schema_version,
      revision, game_seed, political_period, selected_background,
      family_identity, authoritative_state
    ) values (
      '66666666-6666-4666-8666-666666666666',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'save-2.0.0', 'mvp-0.1.0', 'schema-1.0.0', 0,
      'task_10_seed_value_0006', 0, 'civil_service_reformer',
      '{"surname":"Varen"}'::jsonb,
      '{"timeline":{"politicalPeriod":0},"identity":{"selectedBackground":"civil_service_reformer","familyIdentity":{"surname":"Varen"}}}'::jsonb
    )
  $sql$,
  '23514',
  'new row for relation "saves" violates check constraint "saves_supported_save_version"',
  'unsupported save versions are rejected'
);

select throws_ok(
  $sql$
    insert into public.saves (
      save_id, owner_id, save_version, content_version, schema_version,
      revision, game_seed, political_period, selected_background,
      family_identity, authoritative_state
    ) values (
      '66666666-6666-4666-8666-666666666667',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'save-1.0.0', 'mvp-9.9.9', 'schema-1.0.0', 0,
      'task_10_seed_value_0010', 0, 'civil_service_reformer',
      '{"surname":"Varen"}'::jsonb,
      '{"timeline":{"politicalPeriod":0},"identity":{"selectedBackground":"civil_service_reformer","familyIdentity":{"surname":"Varen"}}}'::jsonb
    )
  $sql$,
  '23514',
  'new row for relation "saves" violates check constraint "saves_supported_content_version"',
  'unsupported content versions are rejected'
);

select throws_ok(
  $sql$
    insert into public.saves (
      save_id, owner_id, save_version, content_version, schema_version,
      revision, game_seed, political_period, selected_background,
      family_identity, authoritative_state
    ) values (
      '66666666-6666-4666-8666-666666666668',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'save-1.0.0', 'mvp-0.1.0', 'schema-9.9.9', 0,
      'task_10_seed_value_0011', 0, 'civil_service_reformer',
      '{"surname":"Varen"}'::jsonb,
      '{"timeline":{"politicalPeriod":0},"identity":{"selectedBackground":"civil_service_reformer","familyIdentity":{"surname":"Varen"}}}'::jsonb
    )
  $sql$,
  '23514',
  'new row for relation "saves" violates check constraint "saves_supported_schema_version"',
  'unsupported schema versions are rejected'
);

select throws_ok(
  $sql$
    insert into public.saves (
      save_id, owner_id, save_version, content_version, schema_version,
      revision, game_seed, political_period, selected_background,
      family_identity, authoritative_state
    ) values (
      '66666666-6666-4666-8666-666666666669',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'save-1.0.0', 'mvp-0.1.0', 'schema-1.0.0', 0,
      'task_10_seed_value_0012', 1, 'civil_service_reformer',
      '{"surname":"Varen"}'::jsonb,
      '{"timeline":{"politicalPeriod":0},"identity":{"selectedBackground":"civil_service_reformer","familyIdentity":{"surname":"Varen"}}}'::jsonb
    )
  $sql$,
  '23514',
  'new row for relation "saves" violates check constraint "saves_period_metadata_consistent"',
  'indexed periods must match the authoritative document'
);

select throws_ok(
  $sql$
    insert into public.saves (
      save_id, owner_id, save_version, content_version, schema_version,
      revision, game_seed, political_period, selected_background,
      family_identity, authoritative_state
    ) values (
      '66666666-6666-4666-8666-666666666670',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'save-1.0.0', 'mvp-0.1.0', 'schema-1.0.0', 0,
      'task_10_seed_value_0013', 0, 'civil_service_reformer',
      '{"surname":"Different"}'::jsonb,
      '{"timeline":{"politicalPeriod":0},"identity":{"selectedBackground":"civil_service_reformer","familyIdentity":{"surname":"Varen"}}}'::jsonb
    )
  $sql$,
  '23514',
  'new row for relation "saves" violates check constraint "saves_family_metadata_consistent"',
  'indexed family identity must match the authoritative document'
);

select throws_ok(
  $sql$
    insert into public.saves (
      save_id, owner_id, save_version, content_version, schema_version,
      revision, game_seed, political_period, selected_background,
      family_identity, authoritative_state
    ) values (
      '77777777-7777-4777-8777-777777777777',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'save-1.0.0', 'mvp-0.1.0', null, 0,
      'task_10_seed_value_0007', 0, 'civil_service_reformer',
      '{"surname":"Varen"}'::jsonb,
      '{"timeline":{"politicalPeriod":0},"identity":{"selectedBackground":"civil_service_reformer","familyIdentity":{"surname":"Varen"}}}'::jsonb
    )
  $sql$,
  '23502',
  'null value in column "schema_version" of relation "saves" violates not-null constraint',
  'required indexed save metadata cannot be omitted'
);

select throws_ok(
  $sql$
    insert into public.saves (
      save_id, owner_id, save_version, content_version, schema_version,
      revision, game_seed, political_period, selected_background,
      family_identity, authoritative_state
    ) values (
      '11111111-1111-4111-8111-111111111111',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'save-1.0.0', 'mvp-0.1.0', 'schema-1.0.0', 0,
      'task_10_seed_value_0008', 0, 'civil_service_reformer',
      '{"surname":"Varen"}'::jsonb,
      '{"timeline":{"politicalPeriod":0},"identity":{"selectedBackground":"civil_service_reformer","familyIdentity":{"surname":"Varen"}}}'::jsonb
    )
  $sql$,
  '23505',
  'duplicate key value violates unique constraint "saves_pkey"',
  'duplicate save IDs are rejected'
);

insert into public.saves (
  save_id, owner_id, save_version, content_version, schema_version,
  revision, game_seed, political_period, selected_background,
  family_identity, authoritative_state
) values (
  '88888888-8888-4888-8888-888888888888',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'save-1.0.0', 'mvp-0.1.0', 'schema-1.0.0', 0,
  'task_10_seed_value_0009', 0, 'civil_service_reformer',
  '{"surname":"Orrel"}'::jsonb,
  '{"timeline":{"politicalPeriod":0},"identity":{"selectedBackground":"civil_service_reformer","familyIdentity":{"surname":"Orrel"}}}'::jsonb
);

select lives_ok(
  $sql$
    insert into public.mutation_history (
      save_id, idempotency_key, mutation_type, expected_revision,
      resulting_revision, occurred_at, receipt_body
    ) values (
      '11111111-1111-4111-8111-111111111111', 'choice_0001',
      'choice_resolution', 0, 1, '2026-08-04T00:00:00Z',
      '{"type":"choice_resolution","idempotencyKey":"choice_0001","scenarioId":"scenario_alpha","choiceId":"choice_alpha","expectedRevision":0,"resultingRevision":1,"politicalPeriod":0,"resolvedAt":"2026-08-04T00:00:00Z","appliedEffectIds":[],"createdMemoryIds":[],"addedFlagIds":[],"removedFlagIds":[],"scheduledDelayedEffectIds":[],"scheduledMediaIds":[]}'::jsonb
    )
  $sql$,
  'privileged setup can append a valid choice receipt'
);

select lives_ok(
  $sql$
    insert into public.mutation_history (
      save_id, idempotency_key, mutation_type, expected_revision,
      resulting_revision, occurred_at, receipt_body
    ) values (
      '88888888-8888-4888-8888-888888888888', 'choice_0001',
      'period_advance', 0, 1, '2026-08-04T01:00:00Z',
      '{"type":"period_advance","idempotencyKey":"choice_0001","expectedRevision":0,"resultingRevision":1,"fromPeriod":0,"toPeriod":1,"advancedAt":"2026-08-04T01:00:00Z","appliedEffectIds":[],"executedDelayedEffectIds":[],"cancelledDelayedEffectIds":[],"expiredDelayedEffectIds":[],"failedDelayedEffectIds":[],"scheduledMediaIds":[]}'::jsonb
    )
  $sql$,
  'the same idempotency key is allowed for a different save'
);

select throws_ok(
  $sql$
    insert into public.mutation_history (
      save_id, idempotency_key, mutation_type, expected_revision,
      resulting_revision, occurred_at, receipt_body
    ) values (
      '11111111-1111-4111-8111-111111111111', 'choice_0001',
      'choice_resolution', 0, 1, '2026-08-04T00:00:00Z',
      '{"type":"choice_resolution","idempotencyKey":"choice_0001","expectedRevision":0,"resultingRevision":1,"politicalPeriod":0,"resolvedAt":"2026-08-04T00:00:00Z"}'::jsonb
    )
  $sql$,
  '23505',
  'duplicate key value violates unique constraint "mutation_history_pkey"',
  'idempotency keys are unique within a save'
);

select throws_ok(
  $sql$
    insert into public.mutation_history (
      save_id, idempotency_key, mutation_type, expected_revision,
      resulting_revision, occurred_at, receipt_body
    ) values (
      '11111111-1111-4111-8111-111111111111', 'choice_bad_revision',
      'choice_resolution', 1, 3, '2026-08-04T02:00:00Z',
      '{"type":"choice_resolution","idempotencyKey":"choice_bad_revision","expectedRevision":1,"resultingRevision":3,"politicalPeriod":0,"resolvedAt":"2026-08-04T02:00:00Z"}'::jsonb
    )
  $sql$,
  '23514',
  'new row for relation "mutation_history" violates check constraint "mutation_history_revision_transition"',
  'invalid receipt revision transitions are rejected'
);

select throws_ok(
  $sql$
    insert into public.mutation_history (
      save_id, idempotency_key, mutation_type, expected_revision,
      resulting_revision, occurred_at, receipt_body
    ) values (
      '11111111-1111-4111-8111-111111111111', 'unknown_mutation',
      'unknown', 1, 2, '2026-08-04T02:00:00Z',
      '{"type":"unknown","idempotencyKey":"unknown_mutation","expectedRevision":1,"resultingRevision":2}'::jsonb
    )
  $sql$,
  '23514',
  'new row for relation "mutation_history" violates check constraint "mutation_history_receipt_variant_metadata"',
  'unknown mutation receipt types are rejected'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}',
  true
);

select throws_ok(
  $$select * from public.mutation_history where save_id = '11111111-1111-4111-8111-111111111111'$$,
  '42501',
  'permission denied for table mutation_history',
  'authenticated clients cannot read normalized history directly after TASK-11'
);
select throws_ok(
  $$select * from public.mutation_history where save_id = '88888888-8888-4888-8888-888888888888'$$,
  '42501',
  'permission denied for table mutation_history',
  'authenticated clients cannot read another user history directly'
);
select throws_ok(
  $sql$
    insert into public.mutation_history (
      save_id, idempotency_key, mutation_type, expected_revision,
      resulting_revision, occurred_at, receipt_body
    ) values (
      '11111111-1111-4111-8111-111111111111', 'client_append',
      'choice_resolution', 1, 2, '2026-08-04T03:00:00Z',
      '{"type":"choice_resolution","idempotencyKey":"client_append","expectedRevision":1,"resultingRevision":2,"politicalPeriod":0,"resolvedAt":"2026-08-04T03:00:00Z"}'::jsonb
    )
  $sql$,
  '42501',
  'permission denied for table mutation_history',
  'authenticated clients cannot append mutation history directly'
);
select throws_ok(
  $$update public.mutation_history set resulting_revision = 2 where save_id = '11111111-1111-4111-8111-111111111111'$$,
  '42501',
  'permission denied for table mutation_history',
  'authenticated clients cannot update mutation history'
);
select throws_ok(
  $$delete from public.mutation_history where save_id = '11111111-1111-4111-8111-111111111111'$$,
  '42501',
  'permission denied for table mutation_history',
  'authenticated clients cannot delete mutation history'
);
select throws_ok(
  $$update public.mutation_history set save_id = '88888888-8888-4888-8888-888888888888' where save_id = '11111111-1111-4111-8111-111111111111'$$,
  '42501',
  'permission denied for table mutation_history',
  'authenticated clients cannot reassign mutation history'
);

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select throws_ok(
  $$select * from public.mutation_history$$,
  '42501',
  'permission denied for table mutation_history',
  'anonymous mutation-history reads are denied'
);

reset role;

select ok(
  not has_table_privilege('anon', 'public.profiles', 'SELECT'),
  'anon has no profile SELECT grant'
);
select ok(
  not has_table_privilege('anon', 'public.saves', 'INSERT'),
  'anon has no save INSERT grant'
);
select ok(
  not has_table_privilege('authenticated', 'public.mutation_history', 'INSERT'),
  'authenticated has no mutation-history INSERT grant'
);
select ok(
  not has_table_privilege('authenticated', 'public.mutation_history', 'UPDATE'),
  'authenticated has no mutation-history UPDATE grant'
);
select ok(
  not has_table_privilege('authenticated', 'public.mutation_history', 'DELETE'),
  'authenticated has no mutation-history DELETE grant'
);
select ok(
  not has_column_privilege('authenticated', 'public.saves', 'updated_at', 'UPDATE'),
  'authenticated cannot update save timestamps directly after TASK-11'
);
select ok(
  not has_column_privilege('authenticated', 'public.saves', 'authoritative_state', 'UPDATE'),
  'authenticated cannot replace authoritative state directly'
);
select ok(
  not has_column_privilege('authenticated', 'public.saves', 'owner_id', 'UPDATE'),
  'authenticated cannot update save ownership'
);
select ok(
  not has_table_privilege('service_role', 'public.saves', 'SELECT'),
  'TASK-10 grants no unused Data API save privilege to service_role'
);
select ok(
  has_schema_privilege('authenticated', 'mandate_private', 'USAGE'),
  'authenticated direct server sessions can use explicitly granted private functions'
);
select ok(
  not has_function_privilege('authenticated', 'mandate_private.handle_new_auth_user()', 'EXECUTE'),
  'authenticated cannot execute the privileged auth trigger function'
);
select ok(
  (
    select p.prosecdef
      and exists (
        select 1
        from unnest(coalesce(p.proconfig, array[]::text[])) as setting
        where setting in ('search_path=', 'search_path=""')
      )
    from pg_proc as p
    join pg_namespace as n on n.oid = p.pronamespace
    where n.nspname = 'mandate_private'
      and p.proname = 'handle_new_auth_user'
  ),
  'the auth trigger is SECURITY DEFINER with an empty search_path'
);
select results_eq(
  $$select relrowsecurity and relforcerowsecurity
    from pg_class
    where oid in ('public.profiles'::regclass, 'public.saves'::regclass, 'public.mutation_history'::regclass)
    order by relname$$,
  array[true, true, true],
  'RLS is enabled and forced on every user-owned table'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}',
  true
);
select throws_ok(
  $$delete from public.saves where save_id = '11111111-1111-4111-8111-111111111111'$$,
  '42501',
  'permission denied for table saves',
  'authenticated clients cannot delete saves directly after TASK-11'
);

reset role;

select * from finish();
rollback;
