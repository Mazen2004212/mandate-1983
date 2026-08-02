# Supabase Security Review Checklist

## Contents

- [Preparation](#preparation)
- [Authentication](#authentication)
- [Authorization](#authorization)
- [Supabase Clients](#supabase-clients)
- [RLS](#rls)
- [Save Integrity](#save-integrity)
- [Input Validation](#input-validation)
- [Storage](#storage)
- [Secrets](#secrets)
- [Migrations](#migrations)
- [Hidden Data](#hidden-data)
- [Logging and Errors](#logging-and-errors)
- [Abuse Controls](#abuse-controls)
- [Tests](#tests)
- [Delivery Report](#delivery-report)

## Preparation

- [ ] `AGENTS.md` read
- [ ] Security skill loaded
- [ ] Companion skills loaded where required
- [ ] Complete data flow inspected
- [ ] Schema inspected
- [ ] Migrations inspected
- [ ] Supabase clients inspected
- [ ] Trust boundaries identified
- [ ] Actors identified
- [ ] Data classified
- [ ] Current official documentation checked for implementation-specific behavior

## Authentication

- [ ] Registration reviewed
- [ ] Sign-in reviewed
- [ ] Sign-out reviewed
- [ ] Session expiry reviewed
- [ ] Session refresh reviewed
- [ ] Password reset reviewed
- [ ] Email change reviewed where applicable
- [ ] Account deletion reviewed
- [ ] Disabled-account behavior reviewed
- [ ] Redirects validated
- [ ] Sensitive errors sanitized
- [ ] Account enumeration minimized

## Authorization

- [ ] Authentication separated from authorization
- [ ] UI not treated as enforcement
- [ ] Trusted server authorization present
- [ ] Database enforcement present where applicable
- [ ] Client-supplied role rejected
- [ ] Client-supplied owner rejected
- [ ] Client-supplied hidden state rejected
- [ ] Administrative actions individually authorized
- [ ] Authoritative role source documented

## Supabase Clients

- [ ] Browser client has least privilege
- [ ] Server request client uses the correct request context
- [ ] Privileged client is server-only
- [ ] No privileged import reaches a client bundle
- [ ] No service-role secret reaches the browser
- [ ] No tokens or secrets appear in logs
- [ ] No privileged bypass supports an ordinary player flow
- [ ] Exact client behavior checked against current official documentation

## RLS

For every application-facing table:

- [ ] Data classified
- [ ] RLS decision documented
- [ ] `SELECT` reviewed
- [ ] `INSERT` reviewed
- [ ] `UPDATE` reviewed
- [ ] `DELETE` reviewed
- [ ] New-row validation reviewed
- [ ] Owner tested
- [ ] Other authenticated user tested
- [ ] Anonymous user tested
- [ ] Administrator tested
- [ ] Service process tested where applicable
- [ ] Hidden columns and response projections reviewed

## Save Integrity

- [ ] Ownership enforced
- [ ] Ownership cannot change through player updates
- [ ] Related rows protected
- [ ] Expected revision required
- [ ] Stale writes rejected
- [ ] Idempotency required
- [ ] Duplicate mutation rejected
- [ ] Transaction atomic
- [ ] Partial effects prevented
- [ ] Event log written
- [ ] Hidden state protected
- [ ] Safe response projection used
- [ ] Immutable definitions protected

## Input Validation

- [ ] Typed schema validation used
- [ ] Unknown sensitive fields handled
- [ ] IDs and UUIDs validated
- [ ] Enumerations validated
- [ ] Revision validated
- [ ] Idempotency key validated
- [ ] Pagination and search limited
- [ ] File metadata validated
- [ ] Malformed values are not silently coerced
- [ ] Validation does not replace authorization

## Storage

- [ ] Bucket purpose documented
- [ ] Public/private status documented
- [ ] Read policy reviewed
- [ ] Write policy reviewed
- [ ] Update and delete policies reviewed
- [ ] Ownership path reviewed
- [ ] File-size limit defined
- [ ] Type and extension restrictions defined
- [ ] Unsafe content prevented
- [ ] Signed access scope and expiry reviewed
- [ ] Orphan cleanup reviewed
- [ ] Placeholder and draft exposure prevented
- [ ] Direct object URLs reviewed

## Secrets

- [ ] No real secret committed
- [ ] Public values classified
- [ ] Server-only values classified
- [ ] Environments separated
- [ ] CI secret handling reviewed
- [ ] Rotation plan defined
- [ ] No secret in screenshots
- [ ] No secret in reports
- [ ] No secret in logs
- [ ] Exposure response documented

## Migrations

- [ ] Purpose documented
- [ ] Security impact reviewed
- [ ] RLS and policies reviewed
- [ ] Existing data reviewed
- [ ] Compatibility reviewed
- [ ] Migration order reviewed
- [ ] Staging tested
- [ ] Backup considerations reviewed
- [ ] Rollback or recovery planned
- [ ] Applied migrations not rewritten casually
- [ ] No permanent RLS disablement

## Hidden Data

- [ ] Hidden game state classified
- [ ] Browser response minimized
- [ ] Secret conditions absent from client state and markup
- [ ] Developer fields absent from player responses
- [ ] Logs do not contain unnecessary hidden state
- [ ] Source maps and debug output reviewed where relevant
- [ ] Predictable paths do not reveal secrets

## Logging and Errors

- [ ] Stable error codes used
- [ ] Player messages are safe and useful
- [ ] Detailed diagnostics remain in trusted logs
- [ ] Tokens absent
- [ ] Cookies and authorization headers absent
- [ ] Secrets absent
- [ ] Full save bodies minimized or excluded
- [ ] Administrative actions audited
- [ ] Publication actions audited
- [ ] SQL errors, stack traces, and internal paths hidden from players

## Abuse Controls

- [ ] Authentication attempts reviewed
- [ ] Password-reset attempts reviewed
- [ ] Save creation reviewed
- [ ] Save mutations reviewed
- [ ] Exports reviewed
- [ ] Uploads reviewed
- [ ] Search reviewed
- [ ] Publication reviewed
- [ ] Administrative operations reviewed
- [ ] Rate, quota, cooldown, or timeout strategy documented
- [ ] Duplicate suppression present where required

## Tests

- [ ] Anonymous-deny tests
- [ ] Owner-allow tests
- [ ] Cross-user-deny tests
- [ ] Administrator tests
- [ ] Service-process tests
- [ ] Expired or invalid session tests
- [ ] Stale revision tests
- [ ] Duplicate request tests
- [ ] Partial-failure and atomicity tests
- [ ] Hidden-state exposure tests
- [ ] Storage access and file-validation tests
- [ ] Malformed-input tests
- [ ] Browser-bundle secret checks
- [ ] Unauthorized Server Action and route-handler tests
- [ ] Safe-error tests
- [ ] Secret-free log checks

## Delivery Report

- Security change:
- Protected data:
- Actors:
- Trust boundaries:
- Authentication behavior:
- Authorization behavior:
- Tables and policies:
- Storage:
- Server-only operations:
- Save integrity, revisions, and idempotency:
- Hidden-state handling:
- Secrets impact:
- Migration impact:
- Logging and error behavior:
- Abuse controls:
- Tests executed:
- Negative tests executed:
- Official documentation consulted:
- Remaining risks:
- Limitations:
- Skipped checks and reasons:

A security-sensitive feature is not complete merely because the intended user can use it. Unauthorized users, stale requests, duplicate submissions, malformed clients, cross-user access, hidden-data exposure, and failure paths must also be tested.
