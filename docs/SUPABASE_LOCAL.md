# Local Supabase Foundation

This repository uses Supabase CLI `2.111.0`, `@supabase/supabase-js` `2.112.0`, and `@supabase/ssr` `0.12.4`. TASK-10 is a local foundation only: it does not link to, migrate, seed, or deploy a cloud project.

## Prerequisites and setup

Install Node.js 22, pnpm 11.9.0, and a running Docker-compatible engine. Then:

```powershell
pnpm install --frozen-lockfile
pnpm supabase:start
pnpm supabase:status
pnpm db:reset
pnpm db:lint
pnpm db:test
```

`supabase start` and `supabase status` print local test credentials. Copy only the local API URL and browser-safe anon/publishable key into an untracked `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local browser-safe key>
```

Never copy the local service-role value into a `NEXT_PUBLIC_` variable. This task does not define, validate, or instantiate a service-role client.

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

This repository is not linked to a production project. Do not run `supabase link`, `supabase db push`, or remote migration-repair commands as part of TASK-10.

## Ownership and authority model

`auth.users.id` is the identity authority. Its insert trigger creates exactly one minimal `profiles` row. Authentication secrets remain in the managed Auth schema.

`saves.authoritative_state` stores the full game state. Its embedded `eventHistory` remains the authoritative idempotency and mutation ledger. `mutation_history` is an append-only persistence/audit projection, not a second source of truth.

Database checks enforce supported versions, revision and period ranges, stable seed format, background values, JSON object shape, indexed-to-document identity metadata, per-save idempotency, receipt type, and one-step revision transitions. The strict TypeScript/Zod save and receipt schemas remain responsible for complete document validation at the application boundary in TASK-11.

TASK-10 intentionally permits authenticated save updates only for `updated_at`. No browser role can replace authoritative state or append receipts. TASK-11 must add the reviewed transaction/repository boundary before authoritative mutations are persisted.

## Grants and RLS matrix

| Relation or function | anon | authenticated owner | authenticated non-owner | privileged PostgreSQL setup |
|---|---|---|---|---|
| `profiles` | None | `SELECT`; `UPDATE(updated_at)` | No visible or updated rows | Owner privileges |
| `saves` | None | `INSERT`, `SELECT`, `DELETE`; `UPDATE(updated_at)` | Denied/zero rows; forged ownership rejected | Owner privileges |
| `mutation_history` | None | `SELECT` through owned save | No visible rows | Owner privileges for test setup |
| `mandate_private.handle_new_auth_user()` | No schema usage or execute grant | No schema usage or execute grant | No schema usage or execute grant | Auth trigger only; `SECURITY DEFINER`, empty `search_path` |
| `mandate_private.set_updated_at()` | No schema usage or execute grant | Trigger only | Trigger only | Trigger only; invoker rights, empty `search_path` |

RLS is enabled and forced on all three public tables. Owner policies use `auth.uid()` with explicit `TO authenticated`; insert and update policies use `WITH CHECK`, and select/update/delete policies use `USING`. Table and column grants are intentionally narrower than the policies.

## Inspecting authorization

Run the executable pgTAP suite for anonymous, user A, user B, and privileged fixture contexts:

```powershell
pnpm db:test
```

For manual inspection, query `pg_policies`, `information_schema.role_table_grants`, `information_schema.column_privileges`, and `pg_class.relrowsecurity` through a local SQL session. The optional Studio service is disabled because it is not required for TASK-10. Manual observations do not replace the negative pgTAP assertions.

## Client boundary

The browser client consumes only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The server client is marked `server-only`, uses the same public project identity, and derives the user session from request-scoped Next.js cookies. It does not use elevated credentials. The current `@supabase/ssr` package remains officially documented but pre-1.0; pin updates and cookie API changes must receive explicit review.
