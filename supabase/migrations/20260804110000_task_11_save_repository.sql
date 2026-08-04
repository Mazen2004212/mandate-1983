begin;

alter table public.saves
  drop constraint saves_selected_background;

alter table public.saves
  add constraint saves_selected_background
  check (
    selected_background in (
      'civil_service_reformer',
      'labor_mediator',
      'provincial_governor',
      'security_committee_chair'
    )
  );

drop trigger saves_set_updated_at on public.saves;

revoke all on table public.saves from authenticated;
revoke all on table public.mutation_history from authenticated;

grant usage on schema mandate_private to authenticated;

create function mandate_private.create_owned_save(
  p_save_id uuid,
  p_save_version text,
  p_content_version text,
  p_schema_version text,
  p_revision bigint,
  p_game_seed text,
  p_political_period smallint,
  p_selected_background text,
  p_family_identity jsonb,
  p_authoritative_state jsonb,
  p_created_at timestamptz,
  p_updated_at timestamptz
)
returns public.saves
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_save public.saves;
begin
  if v_actor_id is null then
    raise insufficient_privilege using message = 'authentication required';
  end if;

  insert into public.saves (
    save_id,
    owner_id,
    save_version,
    content_version,
    schema_version,
    revision,
    game_seed,
    political_period,
    selected_background,
    family_identity,
    authoritative_state,
    created_at,
    updated_at
  ) values (
    p_save_id,
    v_actor_id,
    p_save_version,
    p_content_version,
    p_schema_version,
    p_revision,
    p_game_seed,
    p_political_period,
    p_selected_background,
    p_family_identity,
    p_authoritative_state,
    p_created_at,
    p_updated_at
  )
  returning * into v_save;

  return v_save;
end;
$$;

create function mandate_private.read_owned_save(p_save_id uuid)
returns setof public.saves
language sql
stable
security definer
set search_path = ''
as $$
  select saves.*
  from public.saves
  where saves.save_id = p_save_id
    and saves.owner_id = (select auth.uid());
$$;

create function mandate_private.list_owned_saves()
returns setof public.saves
language sql
stable
security definer
set search_path = ''
as $$
  select saves.*
  from public.saves
  where saves.owner_id = (select auth.uid())
  order by saves.updated_at desc, saves.save_id asc;
$$;

create function mandate_private.delete_owned_save(p_save_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
begin
  if v_actor_id is null then
    raise insufficient_privilege using message = 'authentication required';
  end if;

  delete from public.saves
  where saves.save_id = p_save_id
    and saves.owner_id = v_actor_id;

  return found;
end;
$$;

create function mandate_private.lock_owned_save_for_mutation(p_save_id uuid)
returns setof public.saves
language sql
volatile
security definer
set search_path = ''
as $$
  select saves.*
  from public.saves
  where saves.save_id = p_save_id
    and saves.owner_id = (select auth.uid())
  for update;
$$;

create function mandate_private.read_owned_mutation_receipt(
  p_save_id uuid,
  p_idempotency_key text
)
returns setof public.mutation_history
language sql
stable
security definer
set search_path = ''
as $$
  select mutation_history.*
  from public.mutation_history
  join public.saves using (save_id)
  where mutation_history.save_id = p_save_id
    and mutation_history.idempotency_key = p_idempotency_key
    and saves.owner_id = (select auth.uid());
$$;

create function mandate_private.commit_owned_mutation(
  p_save_id uuid,
  p_expected_revision bigint,
  p_resulting_revision bigint,
  p_political_period smallint,
  p_selected_background text,
  p_family_identity jsonb,
  p_authoritative_state jsonb,
  p_updated_at timestamptz,
  p_idempotency_key text,
  p_mutation_type text,
  p_occurred_at timestamptz,
  p_receipt_body jsonb
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_owner_id uuid;
  v_current_revision bigint;
begin
  if v_actor_id is null then
    raise insufficient_privilege using message = 'authentication required';
  end if;

  select saves.owner_id, saves.revision
  into v_owner_id, v_current_revision
  from public.saves
  where saves.save_id = p_save_id
  for update;

  if not found or v_owner_id <> v_actor_id then
    raise insufficient_privilege using message = 'owned save not found';
  end if;

  if exists (
    select 1
    from public.mutation_history
    where mutation_history.save_id = p_save_id
      and mutation_history.idempotency_key = p_idempotency_key
  ) then
    raise unique_violation using message = 'idempotency key already exists';
  end if;

  if v_current_revision <> p_expected_revision then
    raise serialization_failure using message = 'save revision changed';
  end if;

  if p_resulting_revision <> p_expected_revision + 1 then
    raise check_violation using message = 'invalid mutation revision transition';
  end if;

  if p_updated_at <> p_occurred_at then
    raise check_violation using message = 'save and receipt timestamps differ';
  end if;

  if jsonb_typeof(p_authoritative_state -> 'eventHistory') <> 'array'
    or p_authoritative_state -> 'eventHistory' -> -1 <> p_receipt_body then
    raise check_violation using message = 'authoritative history receipt mismatch';
  end if;

  update public.saves
  set revision = p_resulting_revision,
      political_period = p_political_period,
      selected_background = p_selected_background,
      family_identity = p_family_identity,
      authoritative_state = p_authoritative_state,
      updated_at = p_updated_at
  where saves.save_id = p_save_id
    and saves.owner_id = v_actor_id
    and saves.revision = p_expected_revision;

  if not found then
    raise serialization_failure using message = 'save revision changed';
  end if;

  insert into public.mutation_history (
    save_id,
    idempotency_key,
    mutation_type,
    expected_revision,
    resulting_revision,
    occurred_at,
    receipt_body
  ) values (
    p_save_id,
    p_idempotency_key,
    p_mutation_type,
    p_expected_revision,
    p_resulting_revision,
    p_occurred_at,
    p_receipt_body
  );

  return p_resulting_revision;
end;
$$;

revoke all on function mandate_private.create_owned_save(
  uuid, text, text, text, bigint, text, smallint, text, jsonb, jsonb,
  timestamptz, timestamptz
) from public, anon, authenticated, service_role;
revoke all on function mandate_private.read_owned_save(uuid)
  from public, anon, authenticated, service_role;
revoke all on function mandate_private.list_owned_saves()
  from public, anon, authenticated, service_role;
revoke all on function mandate_private.delete_owned_save(uuid)
  from public, anon, authenticated, service_role;
revoke all on function mandate_private.lock_owned_save_for_mutation(uuid)
  from public, anon, authenticated, service_role;
revoke all on function mandate_private.read_owned_mutation_receipt(uuid, text)
  from public, anon, authenticated, service_role;
revoke all on function mandate_private.commit_owned_mutation(
  uuid, bigint, bigint, smallint, text, jsonb, jsonb, timestamptz, text,
  text, timestamptz, jsonb
) from public, anon, authenticated, service_role;

grant execute on function mandate_private.create_owned_save(
  uuid, text, text, text, bigint, text, smallint, text, jsonb, jsonb,
  timestamptz, timestamptz
) to authenticated;
grant execute on function mandate_private.read_owned_save(uuid)
  to authenticated;
grant execute on function mandate_private.list_owned_saves()
  to authenticated;
grant execute on function mandate_private.delete_owned_save(uuid)
  to authenticated;
grant execute on function mandate_private.lock_owned_save_for_mutation(uuid)
  to authenticated;
grant execute on function mandate_private.read_owned_mutation_receipt(uuid, text)
  to authenticated;
grant execute on function mandate_private.commit_owned_mutation(
  uuid, bigint, bigint, smallint, text, jsonb, jsonb, timestamptz, text,
  text, timestamptz, jsonb
) to authenticated;

comment on function mandate_private.commit_owned_mutation(
  uuid, bigint, bigint, smallint, text, jsonb, jsonb, timestamptz, text,
  text, timestamptz, jsonb
) is
  'Private-schema TASK-11 compare-and-swap commit. The server holds the save row lock while the existing TypeScript engine computes the next validated state.';

commit;
