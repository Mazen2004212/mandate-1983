# MANDATE: 1983 Security Architecture

## Contents

- [Security Principles](#security-principles)
- [Trust Boundaries](#trust-boundaries)
- [Actors](#actors)
- [Data Classification](#data-classification)
- [Authentication Lifecycle](#authentication-lifecycle)
- [Authorization Layers](#authorization-layers)
- [Save Security Architecture](#save-security-architecture)
- [Hidden-State Architecture](#hidden-state-architecture)
- [Content Security](#content-security)
- [Storage Architecture](#storage-architecture)
- [Secrets Architecture](#secrets-architecture)
- [Audit Architecture](#audit-architecture)
- [Incident and Recovery Considerations](#incident-and-recovery-considerations)

## Security Principles

- Apply least privilege.
- Deny by default.
- Use defense in depth.
- Resolve mutations authoritatively on trusted servers.
- Enforce ownership in PostgreSQL and RLS.
- Expose only the minimum data needed.
- Make security-sensitive actions exactly auditable.
- Fail safely without leaking internals.
- Use versioned, recoverable migrations.
- Keep security tests reproducible.
- Never trust browser-supplied authority.

## Trust Boundaries

Treat these as distinct conceptual boundaries:

- Player browser
- Next.js Client Components
- Next.js Server Components
- Server Actions
- Route handlers
- Supabase Auth
- PostgreSQL
- Supabase Storage
- Trusted background or administrative processes
- Content-authoring tools
- External image or asset tools

The browser and all browser-supplied data are untrusted. Server Components are not automatically authorization boundaries; verify where code executes and what credentials it uses. Treat Server Actions and route handlers as public entry points that require authentication, authorization, validation, and safe errors. Let PostgreSQL and Storage enforce their own policies even when trusted server checks also exist.

Verify the actual deployment architecture, session flow, caching behavior, and framework boundaries once the application is initialized. Do not prescribe unverified integration details.

## Actors

- **Anonymous visitor:** Has no authenticated identity and receives only explicitly public access.
- **Authenticated player:** May access resources granted to their authoritative identity.
- **Content editor:** May work with authorized draft content but does not automatically publish or administer users.
- **Administrator:** Performs narrowly authorized, auditable administrative actions.
- **Trusted service process:** Uses server-only credentials for a documented, limited purpose.
- **Support operator:** Receives only support permissions necessary for an approved workflow.
- **Suspended account:** Retains only explicitly defined access, normally denying player mutations.
- **Deleted account:** Has no active session access; retained or deleted data follows explicit policy.

Define one authoritative role source. Do not merge product roles, content roles, support roles, and service privileges into a client-controlled flag.

## Data Classification

### Public

Examples include published game metadata, intentionally published static assets, and public legal documents. Public classification must be deliberate and must not include drafts or hidden fields.

### Player-Owned

Examples include saves, settings, achievements, and save exports. Enforce ownership independently of identifier secrecy.

### Private Application Data

Examples include draft content, moderation records, and internal reports. Grant only role-appropriate access.

### Hidden Game Data

Examples include secret event eligibility, hidden threats, undiscovered information, private character intent, and developer-only state. Keep this state server-authoritative and absent from player projections until revealed.

### Security-Sensitive

Examples include sessions, tokens, secrets, administrative roles, and audit records. Minimize access, logging, and retention.

### Regulated or Personal

Minimize collection. Review purpose, consent or other applicable basis, access, retention, deletion, export, and incident obligations before introducing additional personal data.

## Authentication Lifecycle

Review registration, sign-in, session use, refresh, sign-out, password recovery, email change, account deletion, and disabled-account behavior. Define expiry, invalidation, error privacy, redirect validation, reauthentication, and audit behavior.

Verify current Supabase and framework guidance before selecting session storage, refresh, middleware, cookie, or server-client patterns.

## Authorization Layers

Use complementary layers:

1. Present UI capabilities for usability.
2. Authorize each operation at the trusted server boundary.
3. Enforce row access with PostgreSQL RLS.
4. Enforce object access with Storage policies.
5. Audit administrative and other high-impact operations.

UI visibility is never enforcement. A missing button does not prevent a direct request.

## Save Security Architecture

Model the following concepts without requiring one exact table layout before initialization:

- Stable save ID
- Authoritative owner ID
- Monotonic or otherwise safe revision
- Save schema version
- Content version
- Deterministic seed
- Created and updated timestamps
- Ownership and relational constraints
- Atomic mutations
- Idempotency records
- Event history
- Safe snapshots
- Migration support

Resolve authoritative outcomes on the server, validate expected revision, prevent repeated idempotency keys, update state and history atomically, and project only permitted output.

## Hidden-State Architecture

Keep hidden state in server-authoritative storage. Derive response projections for the current player interaction rather than serializing an entire save to the browser. Separate revealed knowledge from underlying truth so disclosure is explicit and testable.

## Content Security

Separate content states:

- Draft
- Validated
- Published
- Deprecated
- Rolled back

Require an authorized, audited transition into publication. Keep published definitions immutable to players. Preserve versions, checksums or integrity records, validation evidence, and rollback capability.

## Storage Architecture

Define conceptual storage areas for published assets, draft assets, private user files, and administrative review material. Decide public/private status, writers, readers, retention, signed access, and cleanup explicitly for each area. Do not allow draft or private objects to inherit public access.

## Secrets Architecture

Separate public configuration, server secrets, CI secrets, development/test credentials, and production credentials. Keep environments isolated. Use least privilege, planned rotation, secret scanning where available, and an exposure response that includes revocation, replacement, log review, and impact assessment.

## Audit Architecture

Audit role changes, content publication, cross-user administrative access, save restoration, account deletion, storage deletion, and migration execution. Record actor, action, target, result, time, and safe correlation data without recording secrets or unnecessary sensitive content.

## Incident and Recovery Considerations

Prepare for secret exposure, unauthorized access, incorrect RLS, accidental publication, data corruption, failed migrations, malicious uploads, and log disclosure.

For each incident, define detection, containment, credential rotation where applicable, access revocation, rollback or restoration, data and policy validation, impact assessment, audit preservation, notification or escalation, and documentation. Never conceal recovery by weakening access controls.
