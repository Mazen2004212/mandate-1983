---
name: mandate-supabase-security
description: "Use when designing, implementing, reviewing, debugging, testing, or changing MANDATE: 1983 authentication, authorization, Supabase clients, PostgreSQL access, Row Level Security, save ownership, server-side mutations, storage access, secrets, security-sensitive migrations, audit logging, or protected data flows. Do not use for visual-only UI work, narrative-writing-only tasks, static art creation, ordinary game balancing without persistence or authorization impact, or documentation unrelated to application security."
---

# Secure MANDATE: 1983 Supabase and Data Access

Enforce security at trusted server, database, and storage boundaries. Treat client-side checks as usability features, never authorization controls. Keep security rules authoritative even when the UI hides an action.

Use `mandate-game-systems` whenever work changes save state, mutations, revision control, delayed effects, hidden state, or persistence behavior. Use `mandate-content-validator` when changes affect production content registries, asset references, publishing, or content-version integrity. Use `mandate-page-builder` and `mandate-ui-director` only when implementing or substantially changing visible authentication, account, save-management, upload, admin, or security-error screens.

Verify every implementation-specific claim against current official Supabase and framework documentation before relying on exact API behavior.

## Understand the Security Change

Before editing:

1. Read `AGENTS.md`, this skill, and all three references.
2. Inspect authentication configuration, Supabase clients, schema, migrations, RLS and storage policies, Server Actions, route handlers, RPC functions, save mutations, environment configuration, and tests.
3. Identify the accessed or changed data and classify it.
4. Identify the actor, entry point, trust boundary, and authorization rule.
5. Identify persistence, migration, concurrency, replay, logging, and privacy impacts.
6. State a brief security implementation and verification plan.

Do not write a policy before understanding the complete data flow.

## Build a Threat Model

For every security-sensitive feature, identify the protected asset, actor, entry point, trust boundary, authentication state, required authorization, cross-user access risk, tampering, replay, duplicate submission, stale write, privilege escalation, information disclosure, abuse or exhaustion, recovery behavior, and audit requirement.

Consider anonymous visitors, authenticated players, other authenticated players, suspended or deleted accounts, content editors, administrators, trusted server processes, compromised browser sessions, malformed clients, and automated abusive clients. Never trust the browser.

## Separate Authentication and Authorization

Use authentication to establish identity and session validity, expiry, and account status. Use authorization to decide whether that actor may read, create, update, delete, invoke mutations, access storage, publish, or administer.

A valid session does not grant general access. Do not rely on hidden buttons, client routing, disabled controls, middleware alone, UI checks, or client-supplied user IDs, roles, ownership, or hidden state. Enforce authorization at the database, trusted server boundary, or both.

## Preserve Supabase Client Boundaries

Distinguish browser, server-request, trusted administrative or service, and test clients.

- Let public browser credentials receive only permissions allowed by RLS and storage policies.
- Create privileged clients only in trusted server-only modules.
- Never expose service-role or equivalent secrets to browsers or client bundles.
- Never log tokens, authorization headers, cookies, secrets, or complete sessions.
- Never commit secrets or use privileged access to conceal a broken RLS policy.
- Never create a helper that silently escalates ordinary requests.

Verify exact client and session integration against current official documentation.

## Require Explicit Row Level Security

Make an explicit access decision for every application-facing table, especially user-owned data, saves, snapshots, decisions, achievements, settings, uploads, private reports, administrative data, drafts, and unpublished content.

Choose deliberately among public read, authenticated read, owner read/create/update/delete, administrator-only, server-process-only, and no direct client access. Review `SELECT`, `INSERT`, `UPDATE`, and `DELETE`, including row visibility and new-row validity. Prevent ordinary updates from changing ownership. Validate inserted ownership against authenticated identity or trusted server logic.

Read `references/rls-and-data-access.md` before designing or reviewing policies.

## Protect Save Ownership

Give every save stable ownership. Ensure players can discover, read, create, update, and delete only permitted saves; cannot transfer ownership; and cannot access another player's save by guessing IDs. Protect snapshots, decisions, and history through parent or direct ownership rules. Define deleted-account and orphan behavior. Keep administrative access narrow, intentional, and auditable.

Never treat unpredictable IDs as authorization.

## Secure Save Mutations

Use `mandate-game-systems` for save-state mutation rules. For every mutation, verify authenticated actor, ownership, input schema, allowed mutation type, preconditions, current and expected revision, idempotency key, atomic transaction, state validation, effect resolution, event log, new revision, safe response, and failure response.

Reject unauthorized actors, unknown mutation types, malformed payloads, stale revisions, duplicate idempotency keys, invalid transitions, client-provided hidden state or calculated outcomes, and attempts to modify immutable definitions. Let browsers submit intent, not authoritative resolved state.

## Enforce Atomicity and Concurrency

Apply each logical decision in one transaction, including choice resolution, save update, event history, delayed effects, memories, flags, revision, achievements, and endings. Prevent partial application.

Use revision-aware optimistic concurrency or another documented safe strategy. Reject stale writes. Make retries unable to duplicate effects, memories, delayed consequences, achievements, endings, currency, inventory, or project changes.

## Protect Hidden State

Classify fields as public, player-visible, qualitative-only, report-dependent, hidden, developer-only, or administrative. Keep hidden and developer-only state server-authoritative and return minimal projections.

Protect coup preparation, intelligence confidence, undiscovered conspirators, secret ending eligibility, unrevealed triggers, private intentions, moderation flags, and administrative notes. Do not leak them through HTML attributes, client state, source maps, disabled controls, predictable paths, logs, or unused response fields.

## Validate Untrusted Input

Validate IDs, UUIDs, enums, mutation names, choices, revisions, idempotency keys, pagination, search, file metadata, size, MIME type, path segments, settings, display names, and customization fields at trusted boundaries with typed schemas such as Zod where appropriate.

Reject unexpected sensitive fields and malformed values without silent coercion. Validation never replaces authorization.

## Secure Storage

For every bucket or root, define purpose, public or private status, readers, writers, deletion, size, content types, naming, ownership paths, retention, content review, signed access, and caching.

Publish production assets only intentionally. Keep drafts and private uploads private. Derive or validate user paths at trusted boundaries. Restrict size, extensions, and content types; prevent unsafe paths and execution; avoid unsafe user-controlled HTML or SVG; scope and expire signed access; and clean up sensitive orphaned files.

## Handle Accounts and Sessions

Review registration, sign-in, sign-out, expiry, refresh, password reset, email change, deletion, disabled accounts, reauthentication, multiple sessions, failures, and redirect validation. Minimize account-enumeration signals. Keep session material out of logs and user-visible errors. Audit sensitive account changes.

## Restrict Administration

Make administrative access explicit, minimal, server-authorized, auditable, revocable, and separate from player ownership. Use one authoritative role source, never browser metadata. Authorize every action individually, including publication, cross-user access, moderation, role changes, migrations, audit access, restore, and deletion. Do not create a universal admin bypass.

## Secure Content Publication

Use `mandate-content-validator` for publishing or replacement. Require valid schema and content versions, zero blocking validation errors, stable IDs, an authorized publisher, audit and integrity records, rollback, draft/published separation, and no player write access.

Keep scenario, character, faction, state-variable, ending, achievement, and published asset definitions immutable to players.

## Protect Secrets

Classify values as public configuration, server-only secret, build secret, development-only secret, or test credential. Never commit, display, screenshot, report, or log real secrets. Never expose server-only values through public environment variables. Separate local, preview, staging, and production values; use least privilege; provide placeholders only in examples; and rotate exposed credentials.

Do not call a secret safe merely because the repository is private.

## Review Security-Sensitive Migrations

Require purpose, forward path, compatibility and existing-data assessment, RLS and policy review, recovery or rollback, backup consideration, staging verification, ordering, and test evidence. Do not rewrite applied production migrations casually or leave RLS disabled.

For a new table, classify data, define access, enable and test RLS where applicable, add deliberate policies, ownership and foreign-key constraints, justified policy indexes, anonymous and cross-user tests, and documented administrative access.

## Log and Fail Safely

Log safe request and actor identifiers, action, resource, result, error code, timestamp, revision, safe idempotency identifier, administration, and publish version as appropriate. Exclude passwords, tokens, headers, cookies, keys, sessions, hidden state, full saves, and unnecessary personal information.

Return stable, useful player errors without SQL details, policy definitions, stack traces, or internal paths. Preserve diagnostic detail only in trusted logs.

## Control Abuse

Consider rate limits, quotas, cooldowns, file-size and pagination limits, timeouts, duplicate suppression, idempotency, and audit alerts for authentication, resets, save creation and mutation, exports, uploads, search, publishing, and administration. Never rely on browser-only abuse controls.

## Test Negative Paths

Test anonymous, valid, expired, signed-out, disabled, and deleted account states where supported. For each relevant RLS operation, test anonymous, owner, other user, administrator, and trusted service actors.

Test ownership reassignment denial, stale revision rejection, duplicate mutation rejection, atomic failure, hidden-state exclusion, public/private storage, cross-user upload denial, invalid paths, oversized and unsupported files, signed-link expiry, missing privileged credentials in browser bundles, rejected unauthorized server actions and handlers, malformed input, safe errors, and secret-free logs.

Never call a policy secure because only the successful owner case passed.

## Complete the Security Review

Review the full data flow, authentication, authorization, RLS, ownership, privileged access, hidden state, validation, atomicity, concurrency, storage, secrets, logs, migrations, negative tests, and browser bundles where relevant. Report only checks actually performed.

Use:

- `references/security-architecture.md`
- `references/rls-and-data-access.md`
- `references/security-review-checklist.md`

## Report Delivery

Report the security change, protected data, actors, trust boundaries, authentication and authorization, tables and storage, RLS, server-only operations, save ownership, revision and idempotency, hidden state, migrations, secrets, logging, abuse controls, tests and negative tests, official documentation consulted, remaining risks, limitations, and skipped checks.

Never claim a feature is secure merely because it compiles, loads, or passes a successful-path test.
