# RLS and Data Access Rules

## Contents

- [Policy Design Process](#policy-design-process)
- [Access Matrix Template](#access-matrix-template)
- [Ownership Rules](#ownership-rules)
- [Policy Operation Rules](#policy-operation-rules)
- [Player Save Rules](#player-save-rules)
- [Public Content Rules](#public-content-rules)
- [Administrative Access](#administrative-access)
- [Storage Policy Rules](#storage-policy-rules)
- [Common RLS Failures](#common-rls-failures)
- [Testing Matrix](#testing-matrix)
- [Policy Performance](#policy-performance)
- [RLS Review Report](#rls-review-report)

## Policy Design Process

For each table:

1. Classify the data.
2. Identify every actor.
3. Decide whether direct browser access is allowed.
4. Decide allowed operations separately.
5. Define authoritative ownership.
6. Define administrative access.
7. Define server-only operations.
8. Define row visibility.
9. Define inserted and updated row validity.
10. Create positive and negative tests.

Document an explicit deny when an operation is unsupported. Never let an omitted design decision become accidental access.

## Access Matrix Template

Complete one row per resource and actor:

| Resource | Actor | Select | Insert | Update | Delete | Server-only actions | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `<resource>` | Anonymous | Deny | Deny | Deny | Deny | None | |
| `<resource>` | Owner | Decide | Decide | Decide | Decide | List | |
| `<resource>` | Other authenticated user | Deny | Deny | Deny | Deny | None | |
| `<resource>` | Content editor | Decide | Decide | Decide | Decide | List | |
| `<resource>` | Administrator | Decide | Decide | Decide | Decide | List | Audit every exceptional action. |
| `<resource>` | Trusted service | Decide | Decide | Decide | Decide | List | Limit to documented purpose. |

Replace every `Decide` with an explicit allow or deny and rationale before implementation.

## Ownership Rules

- Derive owner identity from authenticated context or trusted server logic.
- Prevent ordinary players from reassigning ownership fields.
- Prevent child rows from bypassing parent ownership.
- Use foreign keys and constraints to preserve ownership integrity.
- Define cascade, restrict, archive, or soft-delete behavior explicitly.
- Treat resource IDs as identifiers, never authorization controls.
- Define ownership behavior for account suspension, deletion, restoration, and data export.

Where ownership is inherited, make the relationship enforceable and test it against detached or forged child rows.

## Policy Operation Rules

Review separately:

- `SELECT` row visibility
- `INSERT` new-row validity
- `UPDATE` current-row visibility
- `UPDATE` new-row validity
- `DELETE` permission

Selection permission does not imply update permission. An update must authorize both the existing row and the proposed new row so ownership or protected state cannot change. An insert must reject forged ownership. A delete must follow product retention and recovery rules.

## Player Save Rules

Conceptually require:

- Owner-only read
- Owner-only creation
- Owner-only permitted updates
- Owner-only deletion where product rules allow
- Revision checks for authoritative mutations
- Server-side resolution of game effects
- No cross-user access
- Protected child decisions, history, snapshots, and exports
- Explicit account-deletion and orphan behavior

Do not let clients write complete resolved saves when they should submit mutation intent.

## Public Content Rules

Published definitions may allow public or authenticated read according to product requirements. Restrict writes to authorized publication flows. Keep drafts, validation reports, unpublished assets, and internal metadata from inheriting published access.

Players must not modify authored definitions or published asset metadata. Use `mandate-content-validator` before publication.

## Administrative Access

Require an authoritative role check, trusted server operation, narrow action scope, and audit record for every administrative action. Do not trust a role supplied by the browser or create a universal privileged helper.

Separate content publication, support, moderation, account administration, migration, and audit access when their duties differ.

## Storage Policy Rules

Review:

- Bucket or storage root
- Path ownership model
- Read permission
- Write permission
- Update or replacement permission
- Delete permission
- Signed access scope and expiry
- File size, extension, and content restrictions
- Draft and placeholder visibility
- Orphan cleanup and retention

Do not treat a path containing a user ID as proof of authorization. Do not let direct object URLs bypass intended access.

## Common RLS Failures

- RLS is not enabled.
- An operation policy is missing or unintentionally broad.
- Owner ID is trusted from browser input.
- `UPDATE` permits ownership transfer.
- Child tables lack parent or direct ownership protection.
- Service role is used for an ordinary player request.
- Draft content becomes public.
- Administrator role is read from client input.
- Policy recursion or complexity obscures behavior.
- The owner test passes but cross-user access fails.
- A direct object URL bypasses intended access.
- A storage path is mistaken for authorization.
- A policy exposes hidden columns through an overly broad response.

## Testing Matrix

For each applicable operation and actor, record:

| Resource | Actor | Operation | Expected | Actual | Row count | Error behavior | Exposure | Side effects | Audit result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `<resource>` | `<actor>` | `SELECT/INSERT/UPDATE/DELETE` | Allow/Deny | | | | | | |

Test expected allows and expected denials. Inspect returned row counts, field exposure, errors, side effects, and audit records. Include anonymous, owner, other authenticated user, content editor, administrator, and trusted service where applicable.

## Policy Performance

Review indexed ownership and relationship columns where justified, avoidable per-row expensive checks, policy complexity, and query plans after implementation. Establish security correctness before optimizing. Never weaken authorization to improve performance.

## RLS Review Report

Report:

- Table or storage resource
- Data classification
- Whether RLS is enabled
- Policies by operation
- Actors and authoritative role source
- Positive and negative tests
- Known risks and assumptions
- Administrative path and audit behavior
- Migration and compatibility impact
- Rollback or recovery plan
- Official documentation consulted
