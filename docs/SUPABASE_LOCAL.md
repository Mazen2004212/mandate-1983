# Local Supabase and Save Repository

This repository uses Supabase CLI `2.111.0`, `@supabase/supabase-js` `2.112.0`, `@supabase/ssr` `0.12.4`, and `pg` `8.22.0`. TASK-10 establishes the local Auth, storage, RLS, and grant foundation. TASK-11 adds the server-only save repository and atomic mutation transaction. Neither task links to, migrates, seeds, or deploys a cloud project.

## Prerequisites and setup

Install Node.js 22, pnpm 11.9.0, and a running Docker-compatible engine. Then:

```powershell
pnpm install --frozen-lockfile
pnpm db:start
pnpm supabase:status
pnpm db:reset
pnpm db:lint
pnpm db:test
pnpm test:repository
```

`supabase start` and `supabase status` print local test credentials. Copy the local API URL, browser-safe anon/publishable key, and local database URL into an untracked `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local browser-safe key>
SUPABASE_DATABASE_URL=<local DB_URL from pnpm supabase:status>
```

`SUPABASE_DATABASE_URL` is server-only and must never use a `NEXT_PUBLIC_` prefix. Never copy the local service-role value into a browser variable. The application does not define or instantiate a service-role client.

Stop the stack without creating a backup:

```powershell
pnpm supabase:stop --no-backup
```

Local container state under `supabase/.temp` and `supabase/.branches` is ignored. No seed runs during reset; database tests create their fixtures inside a transaction and roll them back.

## Migration and recovery workflow

Ordered migrations in `supabase/migrations` are the only source of database changes. `pnpm db:reset` rebuilds the local database and applies them in filename order. Do not rewrite a migration after it has been applied to a shared environment.

If local migration execution fails:

1. Read the first PostgreSQL error and fix the unapplied local migration.
2. Run `pnpm db:reset` again; local data is disposable.
3. Run `pnpm db:lint` and `pnpm db:test` before review.
4. If a migration has already reached a shared environment, preserve it and add a later, ordered forward-fix migration. Do not use a destructive rollback against production.
5. For a reviewed emergency rollback, write an explicit inverse migration, test it against a disposable local reset, and have a database backup and restoration plan before any external execution.

This repository is not linked to a production project. Do not run `supabase link`, `supabase db push`, or remote migration-repair commands as part of TASK-10 or TASK-11.

## Ownership and authority model

`auth.users.id` is the identity authority. Its insert trigger creates exactly one minimal `profiles` row. Authentication secrets remain in the managed Auth schema.

`saves.authoritative_state` stores the full game state. Its embedded `eventHistory` remains the authoritative idempotency and mutation ledger. `mutation_history` is an append-only persistence/audit projection, not a second source of truth.

Database checks enforce supported versions, revision and period ranges, stable seed format, background values, JSON object shape, indexed-to-document identity metadata, per-save idempotency, receipt type, and one-step revision transitions. The TASK-11 serialization boundary decodes every complete document through the strict TypeScript/Zod save and receipt schemas and reports compatibility or corruption without repairing stored data.

TASK-11 revokes all direct `authenticated` access to `saves` and `mutation_history`. The browser can neither replace authoritative state nor append receipts. Repository operations run through seven narrowly granted functions in the unexposed `mandate_private` schema.

## Server repository and transaction boundary

The `src/server/persistence` repository resolves the current user through request-scoped Supabase Auth. It then opens one PostgreSQL transaction using the server-only `SUPABASE_DATABASE_URL`, installs the verified user identity as the transaction-local authenticated claim, assumes the `authenticated` database role, and calls only the private persistence functions.

For choice resolution and period advancement, the transaction locks the owned save, reads any persisted idempotency receipt before revision rejection, validates and runs the existing TypeScript mutation engine, then updates the save and inserts the normalized receipt together. A failure rolls back both writes. Browser input is restricted to mutation intent; it cannot provide an owner, calculated effects, or authoritative state.

The private functions are not in the configured PostgREST schemas. Each privileged function checks `auth.uid()` and ownership internally, uses `SECURITY DEFINER` with an empty `search_path`, and has an explicit `authenticated` execute grant. No function accepts an owner identity as authority.

## Grants and RLS matrix

| Relation or function | anon | authenticated owner | authenticated non-owner | privileged PostgreSQL setup |
|---|---|---|---|---|
| `profiles` | None | `SELECT`; `UPDATE(updated_at)` | No visible or updated rows | Owner privileges |
| `saves` | None | No direct table grant; private repository functions enforce ownership | Same safe not-found behavior through the repository | Owner privileges |
| `mutation_history` | None | No direct table grant; private transaction writes and reads receipts | Same safe not-found behavior through the repository | Owner privileges for test setup |
| `mandate_private.handle_new_auth_user()` | No schema usage or execute grant | No schema usage or execute grant | No schema usage or execute grant | Auth trigger only; `SECURITY DEFINER`, empty `search_path` |
| TASK-11 private repository functions | No schema usage or execute grant | Explicit execute only; every operation derives `auth.uid()` and checks ownership | Cannot target another user's save | Owner privileges |

RLS is enabled and forced on all three public tables. Owner policies use `auth.uid()` with explicit `TO authenticated`; insert and update policies use `WITH CHECK`, and select/update/delete policies use `USING`. Table and column grants are intentionally narrower than the policies.

## Inspecting authorization

Run the executable pgTAP suite for anonymous, user A, user B, and privileged fixture contexts, then run the server repository integration suite against the same local PostgreSQL instance:

```powershell
pnpm db:test
pnpm test:repository
```

For manual inspection, query `pg_policies`, `information_schema.role_table_grants`, `information_schema.column_privileges`, and `pg_class.relrowsecurity` through a local SQL session. The optional Studio service is disabled because it is not required for TASK-10. Manual observations do not replace the negative pgTAP assertions.

## Client boundary

The browser client consumes only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The request-scoped Auth client and save repository are marked `server-only`. The Auth client derives the user session from Next.js cookies and uses the public project identity; the repository's PostgreSQL connection is confined to the server transaction gateway. Neither uses a service-role credential. The current `@supabase/ssr` package remains pre-1.0; pin updates and cookie API changes require explicit review.
