---
name: mandate-release-gate
description: "Use when preparing, evaluating, verifying, approving, blocking, documenting, deploying, or reviewing a MANDATE: 1983 release candidate, preview deployment, production deployment, major merge, migration rollout, content publication, or other high-risk delivery. Do not use for ordinary feature implementation, isolated prose drafting, visual concept work, routine local experimentation, or small changes that are not being evaluated for integration or release readiness."
---

# Gate MANDATE: 1983 Releases

Orchestrate release verification without replacing specialist skills. Load and use every specialist skill relevant to the release scope.

Never pass a gate unless its check was executed and inspected. Never convert skipped, unavailable, or indeterminate checks into passes. Never deploy merely because the application builds, declare production readiness from a preview alone, or hide blocking failures. Do not make broad unrelated fixes during evaluation without explicit remediation authorization. When a gate fails, identify the precise blocker and responsible owner or skill.

## Coordinate Specialist Skills

- Use `mandate-ui-director` when visible UI, responsive layout, visual hierarchy, design-system compliance, or rendered screenshots changed.
- Use `mandate-page-builder` when a complete player-facing page or major screen changed.
- Use `mandate-game-systems` when simulation, state, persistence, determinism, elections, coups, war, economy, delayed effects, or endings changed.
- Use `mandate-narrative-author` when production narrative, dialogue, branching, continuity, voice, media, endings, or epilogues changed.
- Use `mandate-content-validator` whenever production content, registries, references, effects, assets, versions, or publishing changed.
- Use `mandate-character-art-director` when portraits, expressions, presets, character asset references, or final art status changed.
- Use `mandate-supabase-security` whenever authentication, authorization, database access, RLS, storage, migrations, secrets, saves, hidden state, privileged clients, or security-sensitive flows changed.

## Define the Release

Before executing checks:

1. Read `AGENTS.md`, this skill, and all three references.
2. Inspect repository status, recent changes, authoritative package scripts, CI configuration, documentation, and established commands.
3. Identify release type, target environment, scope, included commit or change set, exclusions, and user-visible changes.
4. Identify data, content, security, asset, and migration changes.
5. Select required specialist skills.
6. Identify available scripts, CI jobs, environments, test tools, unavailable checks, and external dependencies.
7. Classify release risk.
8. State a concise verification plan before changing or deploying anything.

Do not invent commands when the repository defines authoritative scripts.

## Classify Release Type and Risk

Support local integration review, pull-request or major-merge gate, preview deployment, internal release candidate, staging release, production release, content-only publication, database or migration rollout, emergency patch, and rollback verification. Apply the strictest relevant gates to production.

Classify risk:

- **Low:** Documentation-only changes, behavior-neutral refactoring, approved asset-metadata correction, or non-functional test maintenance.
- **Medium:** Isolated UI, non-critical pages, narrative/content without schema changes, minor dependencies, or non-breaking APIs.
- **High:** Save mutations, authentication/authorization, RLS/storage policies, migrations, content schemas, core simulations or endings, major navigation/onboarding, asset-pipeline replacement, or significant dependencies.
- **Critical:** Production/save-format migrations, privileged-client or service-role changes, incident fixes, broad RLS redesigns, incompatible production content, destructive operations, or reduced-verification emergencies.

Let risk determine approvals, environments, test depth, rollback, backups, monitoring, and whether skips are acceptable. Never downgrade risk to avoid verification.

## Use Exact Gate Statuses

Use exactly:

- `Not evaluated`
- `Passed`
- `Passed with accepted warnings`
- `Blocked`
- `Not applicable`

`Passed` requires inspected evidence. `Passed with accepted warnings` requires documented impact and explicit acceptance. `Blocked` prevents release. `Not applicable` requires a scope reason. `Not evaluated` cannot support approval; a required production gate left not evaluated blocks release. A failed command is not a warning merely because another command passed.

## Verify Repository and Change Integrity

Verify the root, branch, intended change set, working tree, conflicts and markers, generated and temporary files, lockfile and manifest consistency, binaries, changed-file secrets, debug code, bypasses, disabled controls, placeholder content, and rejected or deprecated assets.

Report a dirty working tree precisely. Classify untracked files instead of assuming they are accidental.

## Verify Build and Static Checks

When code exists, execute authoritative commands for dependency integrity, types, lint, formatting verification, production build, generated code, schema generation, dead references, import and client-bundle boundaries, and environment variables as applicable.

Record exact command, environment, exit code, result, warnings, and duration when available. A build never replaces tests, content validation, security review, or browser verification.

## Verify Tests

Run relevant unit, domain, invariant, integration, component, route-handler, Server Action, database, RLS, Storage, content-schema, content-reference, save-migration, end-to-end, accessibility, browser smoke, visual, and performance tests.

Record commands, environment, discovered counts, failures, skips, retries, and flaky behavior. Disclose retried flaky tests. Zero discovered required tests is not a pass.

## Gate Game Systems

Use `mandate-game-systems`. Verify strict types, ranges, exact money, seeded determinism, idempotency, revision control, delayed effects, duplicate prevention, eligibility, save/load and migration, economy periods, elections, coups, war turns, endings, debug explanations, edge cases, and invariants.

Require fixed-seed tests. Do not approve simulation changes from one expected scenario.

## Gate Narrative and Content

Use `mandate-narrative-author` and `mandate-content-validator`. Require zero blocking validation errors, reviewed warnings, stable IDs, resolved references, valid fields/effects/eligibility/delays, safe branching, no mandatory cycles, reachable required content, correct family tokens, continuity, teen rating, originality status, ending coverage, content/schema versions, implemented checksums, save compatibility, and rollback.

Schema validity alone is insufficient. Block production publication when required validation was not executed.

## Gate UI, Accessibility, and Visuals

Use `mandate-ui-director` and `mandate-page-builder`. Inspect actual rendered pages and applicable loading, empty, error, unauthorized, degraded, success, and confirmation states. Verify responsiveness, keyboard and focus, accessible names and errors, contrast, zoom, motion, touch targets, overflow, long customized names, portrait crops, screenshots, console, failed requests, hydration, and layout shift at project viewports.

Do not approve visible work using only unit tests or route responses. Record real screenshot paths.

## Gate Character Art

Use `mandate-character-art-director`. Verify stable references, approved status, placeholder/rejected/deprecated exclusion, fictional originality, no real likenesses, period and anatomy, expression and clothing consistency, crop, dimensions, optimization, metadata, prompt version, rights, contact sheet, real UI integration, responsiveness, and accessibility.

An isolated image review cannot grant final approval.

## Gate Security

Use `mandate-supabase-security`. Verify authentication, authorization, trust boundaries, browser/server client separation, secret-free client bundles, RLS operations and new-row validation, ownership and cross-user denial, hidden state, input validation, atomicity, revisions, idempotency, Storage, secrets, logs, errors, abuse controls, migration security, administration, and auditing.

Require negative tests. A successful owner path is insufficient.

## Gate Database and Migrations

For each schema change, verify purpose, forward migration, order, existing-data and save compatibility, RLS/policy/constraint/index/Storage impact, backfill, transactions, failures, staging evidence, backup, recovery or rollback, and post-migration validation.

Do not rewrite applied production migrations casually, approve destructive changes without recovery, or claim rollback after unrecoverable destruction without backup.

## Gate Environment and Secrets

For local, CI, preview, staging, and production targets, verify documented required variables, public/server classification, secret-free repository/logs/screenshots, no public privileged credentials, environment separation, rotation considerations, preview isolation from production credentials, scoped test credentials, and safe missing-variable behavior.

Never copy secrets into release evidence.

## Gate Performance and Reliability

Use project-defined budgets for load, transitions, bundles, images, server responses, queries, large saves, content, memory, repeated turns, sessions, and recovery where applicable. Review pagination, timeouts, retries, duplicates, degraded behavior, dependency and asset failure, slow databases, rate limits, and log volume.

Do not invent budgets. Report materially missing budgets as readiness gaps.

## Verify Browsers and Environments

Record actual browser, version, operating system, viewport, environment target, role, save/scenario, and result. Never infer cross-browser support from one browser.

## Verify Deployment Readiness

Before deployment, verify environment, authorized deployer, project, branch/commit, artifact, configuration, database, migrations, content/assets, domains/redirects, monitoring, rollback target, backup, communications, and smoke-test plan.

Do not deploy during review-only work. Require explicit user authorization for real deployment or production mutation.

## Plan Rollback and Recovery

For every high-risk or critical release, define rollback trigger, decision owner, known-good version, application/content/database/asset recovery, secret rotation, data validation, user impact, and post-rollback verification.

Distinguish application rollback, content rollback, migration rollback, backup restoration, and forward-fix. Application rollback does not automatically reverse database or content changes.

## Verify After Deployment

After authorized deployment, run applicable availability, navigation, authentication, new-game, save, choice, revision, content, asset, database, RLS, monitoring, console, API, performance, migration, and log smoke tests. Verify intended access and safe critical denials without exposing production data.

## Block Unsafe Releases

Block applicable releases for failed builds or types, required test failures or zero tests, blocking content errors, broken references, invalid save migrations, deterministic regressions, cross-user access, broken RLS, privileged-secret or hidden-state exposure, destructive migrations without recovery, missing variables, final placeholders or unknown art rights, broken critical flows, critical accessibility failures, unreviewed high-risk warnings, missing high-risk rollback, or required gates still `Not evaluated`.

Allow warnings only when documented, understood, accepted by an authorized owner, and compatible with mandatory security and data rules.

## Make One Final Decision

Use exactly:

- `Approved`
- `Approved with accepted warnings`
- `Blocked`
- `Incomplete evaluation`

Approve only when every required gate passed, blockers are absent, evidence exists, and rollback requirements are satisfied. Approve with warnings only when every required gate ran and an identified owner accepted documented warnings. Block on failed gates, blockers, unreviewed required warnings, or unacceptable security/data/migration risk. Mark incomplete when tools, environments, scope, checks, or evidence were unavailable.

Never approve an incomplete evaluation.

## Preserve Evidence and Report

For every executed gate, record gate, status, exact command or procedure, environment, real evidence, result, warning/blocker, related skill, and owner where known. Never fabricate paths, links, counts, screenshots, or outputs.

Use:

- `references/release-criteria.md`
- `references/verification-matrix.md`
- `references/release-report-template.md`

Report release identity/type/target/change set/scope/exclusions/risk, specialist skills, repository state, gates, commands/tests, browser/screenshots, content/security/migration/asset/performance/environment results, deployment and rollback readiness, post-deploy plan, errors, warnings, risks, unexecuted checks, final decision, and owner.

Never call a release safe, production-ready, or approved merely because it compiles, loads, or passes successful-path tests.
