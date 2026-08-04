begin;

revoke create on schema public from public, anon, authenticated;
grant usage on schema public to anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke all on tables from public, anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke all on sequences from public, anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke all on functions from public, anon, authenticated, service_role;

create schema if not exists mandate_private authorization postgres;
revoke all on schema mandate_private from public, anon, authenticated, service_role;

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint profiles_updated_after_creation
    check (updated_at >= created_at)
);

comment on table public.profiles is
  'Minimal application profile. Authentication secrets remain exclusively in Supabase Auth.';

create table public.saves (
  save_id uuid primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  save_version text not null,
  content_version text not null,
  schema_version text not null,
  revision bigint not null,
  game_seed text not null,
  political_period smallint not null,
  selected_background text not null,
  family_identity jsonb not null,
  authoritative_state jsonb not null,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint saves_supported_save_version
    check (save_version = 'save-1.0.0'),
  constraint saves_supported_content_version
    check (content_version = 'mvp-0.1.0'),
  constraint saves_supported_schema_version
    check (schema_version = 'schema-1.0.0'),
  constraint saves_revision_range
    check (revision between 0 and 9007199254740991),
  constraint saves_game_seed_format
    check (
      char_length(game_seed) between 16 and 128
      and game_seed ~ '^[A-Za-z0-9_-]+$'
    ),
  constraint saves_political_period_range
    check (political_period between 0 and 6),
  constraint saves_selected_background
    check (
      selected_background in (
        'civil_service_reformer',
        'labor_mediator',
        'provincial_governor',
        'security_insider'
      )
    ),
  constraint saves_family_identity_object
    check (jsonb_typeof(family_identity) = 'object'),
  constraint saves_authoritative_state_object
    check (jsonb_typeof(authoritative_state) = 'object'),
  constraint saves_period_metadata_consistent
    check (
      authoritative_state #>> '{timeline,politicalPeriod}' is not null
      and authoritative_state #>> '{timeline,politicalPeriod}' = political_period::text
    ),
  constraint saves_background_metadata_consistent
    check (
      authoritative_state #>> '{identity,selectedBackground}' is not null
      and authoritative_state #>> '{identity,selectedBackground}' = selected_background
    ),
  constraint saves_family_metadata_consistent
    check (
      authoritative_state #> '{identity,familyIdentity}' is not null
      and authoritative_state #> '{identity,familyIdentity}' = family_identity
    ),
  constraint saves_updated_after_creation
    check (updated_at >= created_at)
);

comment on table public.saves is
  'Authoritative save documents. Full Zod validation remains an application-boundary responsibility.';
comment on column public.saves.authoritative_state is
  'The complete authoritative game state; hidden fields are not split into client-writable columns.';

create index saves_owner_updated_at_idx
  on public.saves (owner_id, updated_at desc);

create table public.mutation_history (
  save_id uuid not null references public.saves (save_id) on delete cascade,
  idempotency_key text not null,
  mutation_type text not null,
  expected_revision bigint not null,
  resulting_revision bigint not null,
  occurred_at timestamptz not null,
  receipt_body jsonb not null,
  created_at timestamptz not null default statement_timestamp(),
  primary key (save_id, idempotency_key),
  constraint mutation_history_idempotency_key_format
    check (
      char_length(idempotency_key) between 1 and 128
      and idempotency_key ~ '^[A-Za-z0-9_-]+$'
    ),
  constraint mutation_history_type
    check (mutation_type in ('choice_resolution', 'period_advance')),
  constraint mutation_history_expected_revision_range
    check (expected_revision between 0 and 9007199254740991),
  constraint mutation_history_resulting_revision_range
    check (resulting_revision between 1 and 9007199254740991),
  constraint mutation_history_revision_transition
    check (resulting_revision = expected_revision + 1),
  constraint mutation_history_receipt_object
    check (jsonb_typeof(receipt_body) = 'object'),
  constraint mutation_history_receipt_identity
    check (
      receipt_body ->> 'type' is not null
      and receipt_body ->> 'type' = mutation_type
      and receipt_body ->> 'idempotencyKey' is not null
      and receipt_body ->> 'idempotencyKey' = idempotency_key
      and receipt_body ->> 'expectedRevision' is not null
      and (receipt_body ->> 'expectedRevision')::bigint = expected_revision
      and receipt_body ->> 'resultingRevision' is not null
      and (receipt_body ->> 'resultingRevision')::bigint = resulting_revision
    ),
  constraint mutation_history_receipt_variant_metadata
    check (
      case mutation_type
        when 'choice_resolution' then
          receipt_body ->> 'politicalPeriod' is not null
          and (receipt_body ->> 'politicalPeriod')::smallint between 0 and 6
          and receipt_body ->> 'resolvedAt' is not null
          and (receipt_body ->> 'resolvedAt')::timestamptz = occurred_at
        when 'period_advance' then
          receipt_body ->> 'fromPeriod' is not null
          and (receipt_body ->> 'fromPeriod')::smallint between 0 and 5
          and receipt_body ->> 'toPeriod' is not null
          and (receipt_body ->> 'toPeriod')::smallint =
            (receipt_body ->> 'fromPeriod')::smallint + 1
          and receipt_body ->> 'advancedAt' is not null
          and (receipt_body ->> 'advancedAt')::timestamptz = occurred_at
        else false
      end
    )
);

comment on table public.mutation_history is
  'Append-only persistence and audit projection of receipts embedded in saves.authoritative_state.eventHistory; the embedded history remains authoritative.';

create index mutation_history_save_revision_idx
  on public.mutation_history (save_id, resulting_revision);

create function mandate_private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = statement_timestamp();
  return new;
end;
$$;

create function mandate_private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id) values (new.id);
  return new;
end;
$$;

revoke all on function mandate_private.set_updated_at() from public, anon, authenticated, service_role;
revoke all on function mandate_private.handle_new_auth_user() from public, anon, authenticated, service_role;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function mandate_private.set_updated_at();

create trigger saves_set_updated_at
before update on public.saves
for each row execute function mandate_private.set_updated_at();

create trigger create_profile_after_auth_user
after insert on auth.users
for each row execute function mandate_private.handle_new_auth_user();

alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.saves enable row level security;
alter table public.saves force row level security;
alter table public.mutation_history enable row level security;
alter table public.mutation_history force row level security;

create policy profiles_owner_select
on public.profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy profiles_owner_update
on public.profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy saves_owner_insert
on public.saves
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy saves_owner_select
on public.saves
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy saves_owner_update
on public.saves
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy saves_owner_delete
on public.saves
for delete
to authenticated
using ((select auth.uid()) = owner_id);

create policy mutation_history_owner_select
on public.mutation_history
for select
to authenticated
using (
  exists (
    select 1
    from public.saves
    where saves.save_id = mutation_history.save_id
      and saves.owner_id = (select auth.uid())
  )
);

revoke all on table public.profiles from public, anon, authenticated, service_role;
revoke all on table public.saves from public, anon, authenticated, service_role;
revoke all on table public.mutation_history from public, anon, authenticated, service_role;

grant select on table public.profiles to authenticated;
grant update (updated_at) on table public.profiles to authenticated;

grant select on table public.saves to authenticated;
grant insert (
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
  authoritative_state
) on public.saves to authenticated;
grant update (updated_at) on table public.saves to authenticated;
grant delete on table public.saves to authenticated;

grant select on table public.mutation_history to authenticated;

commit;
