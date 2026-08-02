# MANDATE: 1983 Release Criteria

## Contents

- [Release Principles](#release-principles)
- [Release Categories](#release-categories)
- [Risk Levels](#risk-levels)
- [Gate Statuses](#gate-statuses)
- [Universal Gates](#universal-gates)
- [Production Blockers](#production-blockers)
- [Warning Acceptance](#warning-acceptance)
- [Emergency Release Rules](#emergency-release-rules)
- [Completion Definition](#completion-definition)

## Release Principles

- Prefer evidence over assumption.
- Complete required gates before convenience work.
- Preserve specialist ownership of specialist decisions.
- Make verification reproducible.
- Report incomplete evaluation honestly.
- Deny production release while blockers remain.
- Minimize production risk and scope.
- Define rollback explicitly.
- Keep secrets out of evidence.
- Never claim unverified success.

## Release Categories

- **Local integration:** Evaluate combined local changes without deployment.
- **Pull request:** Gate a proposed merge and its exact change set.
- **Preview:** Verify an isolated deployable preview without treating it as production proof.
- **Release candidate:** Freeze and evaluate a version intended for staging or production.
- **Staging:** Verify release behavior in a production-like controlled environment.
- **Production:** Apply the strictest applicable gates, authorization, rollback, and post-deploy checks.
- **Content publication:** Validate and publish versioned authored content without assuming application deployment.
- **Migration rollout:** Change schema or data with staging, backup, recovery, and post-migration validation.
- **Emergency patch:** Minimize scope and document any reduced non-critical checks.
- **Rollback:** Verify recovery to a known-good application, content, data, or asset state.

## Risk Levels

| Risk | Typical change | Minimum environment | Required review depth | Rollback requirement | Approval expectation |
| --- | --- | --- | --- | --- | --- |
| Low | Documentation, behavior-neutral refactor, metadata correction | Local or CI as applicable | Scope and relevant universal gates | Document if behavior or published artifacts change | Normal project review |
| Medium | Isolated UI, non-critical page, narrative/content without schema changes, minor dependency | CI and preview where rendered behavior changes | Relevant specialist, tests, browser/content checks | Practical rollback or revert path | Explicit release review |
| High | Saves, auth, RLS, migrations, content schemas, core simulation, major navigation | CI plus staging or equivalent | Full relevant specialist gates and negative tests | Detailed, tested or credibly verified plan | Authorized high-risk approval |
| Critical | Production/save migration, privileged clients, incident fixes, broad RLS, destructive or incompatible change | Production-like staging plus authorized production controls | Strictest gates, backups, recovery rehearsal where feasible, monitoring | Mandatory detailed recovery and decision owner | Explicit critical approval |

Do not prescribe named individuals before governance exists. Identify an accountable role or owner for the actual release.

## Gate Statuses

| Status | Meaning | Permits production release | Evidence required |
| --- | --- | --- | --- |
| Not evaluated | Check did not run or evidence is unavailable | No, when required | Reason, impact, and owner for completion |
| Passed | Check ran successfully and result was inspected | Yes, if every required gate qualifies | Command/procedure, environment, result, real evidence |
| Passed with accepted warnings | Check ran; non-blocking warning was explicitly accepted | Yes, if mandatory rules remain satisfied | Evidence, warning analysis, acceptance owner, follow-up |
| Blocked | Check failed or found a release blocker | No | Failure evidence, correction, owner, retest requirement |
| Not applicable | Scope makes the gate irrelevant | Yes | Scope-based reason |

## Universal Gates

- [ ] Repository integrity verified
- [ ] Scope and exclusions understood
- [ ] Correct branch, commit, or change set verified
- [ ] No unresolved conflicts or markers
- [ ] Build executed when applicable
- [ ] Type checking executed when applicable
- [ ] Required tests executed
- [ ] Content integrity verified where applicable
- [ ] Security verified where applicable
- [ ] Migration safety verified where applicable
- [ ] Rendered UI verified where applicable
- [ ] Accessibility verified where applicable
- [ ] Asset readiness verified where applicable
- [ ] Target environment ready
- [ ] Rollback ready
- [ ] Evidence recorded
- [ ] Final report completed

## Production Blockers

Block production for applicable unresolved issues:

- Failed production build or type check
- Required test failures or zero discovered required tests
- Blocking content-validation errors or broken required references
- Invalid save migration or deterministic regression
- Unauthorized cross-user access, missing/broken RLS, or privileged-secret exposure
- Hidden-state exposure
- Destructive migration without credible recovery
- Missing required environment variables
- Placeholder art presented as final or unknown required-art rights
- Broken critical player flow
- Critical accessibility failure
- Unreviewed high-risk warning
- Missing rollback for high-risk or critical scope
- Any required gate still `Not evaluated`

## Warning Acceptance

Record:

- Warning and affected gate
- Impact and likelihood
- Mitigation
- Acceptance owner
- Expiration or follow-up
- Rollback implication

Warnings cannot override mandatory security, privacy, authorization, save-integrity, migration-recovery, or data-integrity rules.

## Emergency Release Rules

Reduce non-critical verification only when the emergency reason is documented, scope is minimized, security and data-safety checks remain mandatory, rollback is ready, every skipped check is documented, post-release verification is expanded, and follow-up work has ownership.

Urgency never produces automatic approval.

## Completion Definition

A release is complete only when authorized deployment or publication succeeded, post-deployment checks passed, blockers remain absent, evidence is stored, rollback status is known, the report is complete, and remaining warnings have accountable ownership.
