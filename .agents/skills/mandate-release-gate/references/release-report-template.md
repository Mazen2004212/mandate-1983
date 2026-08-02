# MANDATE: 1983 Release Report

## Contents

- [Release Identity](#release-identity)
- [Scope](#scope)
- [Risk Assessment](#risk-assessment)
- [Specialist Skills Used](#specialist-skills-used)
- [Repository State](#repository-state)
- [Gate Summary](#gate-summary)
- [Commands Executed](#commands-executed)
- [Tests](#tests)
- [Game-System Verification](#game-system-verification)
- [Narrative and Content Verification](#narrative-and-content-verification)
- [UI and Accessibility](#ui-and-accessibility)
- [Character Art](#character-art)
- [Security](#security)
- [Database and Migrations](#database-and-migrations)
- [Environment and Deployment](#environment-and-deployment)
- [Performance and Reliability](#performance-and-reliability)
- [Rollback Plan](#rollback-plan)
- [Post-Deployment Checks](#post-deployment-checks)
- [Blocking Issues](#blocking-issues)
- [Accepted Warnings](#accepted-warnings)
- [Checks Not Executed](#checks-not-executed)
- [Known Risks](#known-risks)
- [Final Decision](#final-decision)

Replace every placeholder with inspected evidence or an honest `Not evaluated`/`Not applicable` result. Never include secrets.

## Release Identity

- Release name:
- Release version:
- Release type:
- Target environment:
- Date:
- Branch:
- Commit:
- Change range:
- Content version:
- Save schema version:
- Database migration version:
- Asset version:
- Release operator:
- Reviewers:

## Scope

- Included changes:
- Excluded changes:
- User-visible changes:
- System changes:
- Narrative changes:
- Content changes:
- Security changes:
- Database changes:
- Asset changes:
- Known dependencies:

## Risk Assessment

- Risk level:
- Risk reasons:
- Data risk:
- Security risk:
- Save-compatibility risk:
- Content risk:
- UI risk:
- Deployment risk:

## Specialist Skills Used

| Skill | Reason | Loaded | Findings |
| --- | --- | --- | --- |
| mandate-release-gate | Release orchestration | | |
| mandate-ui-director | Visible UI and rendered quality | | |
| mandate-page-builder | Complete major pages | | |
| mandate-game-systems | Simulation and saves | | |
| mandate-narrative-author | Narrative and continuity | | |
| mandate-content-validator | Content integrity | | |
| mandate-character-art-director | Character assets | | |
| mandate-supabase-security | Security and persistence | | |

## Repository State

- Repository root:
- Branch:
- Commit:
- Initial Git status:
- Final Git status:
- Untracked files:
- Conflicts:
- Lockfile state:
- Temporary files:
- Secret-scan status:

## Gate Summary

| Gate | Status | Evidence | Warning or blocker | Related skill |
| --- | --- | --- | --- | --- |
| | Not evaluated | | | |

Allowed statuses: `Not evaluated`, `Passed`, `Passed with accepted warnings`, `Blocked`, `Not applicable`.

## Commands Executed

For each command:

- Command:
- Purpose:
- Environment:
- Exit code:
- Result:
- Relevant output:
- Duration:
- Evidence path:

## Tests

| Suite | Command | Discovered | Passed | Failed | Skipped | Retried | Environment | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Unit | | | | | | | | Not evaluated |
| Integration | | | | | | | | Not evaluated |
| Component | | | | | | | | Not evaluated |
| Domain and invariant | | | | | | | | Not evaluated |
| Content | | | | | | | | Not evaluated |
| Database | | | | | | | | Not evaluated |
| RLS | | | | | | | | Not evaluated |
| Storage | | | | | | | | Not evaluated |
| End-to-end | | | | | | | | Not evaluated |
| Accessibility | | | | | | | | Not evaluated |
| Performance | | | | | | | | Not evaluated |
| Browser smoke | | | | | | | | Not evaluated |

## Game-System Verification

- State ranges:
- Exact money:
- Determinism:
- Idempotency:
- Revision handling:
- Delayed effects:
- Save/load:
- Migration:
- Elections:
- Coups:
- War:
- Endings:
- Invariants:
- Limitations:

## Narrative and Content Verification

- Schema:
- IDs:
- References:
- Effects:
- Eligibility:
- Branching:
- Reachability:
- Continuity:
- Family tokens:
- Content rating:
- Originality review:
- Ending coverage:
- Content version:
- Validation decision:

## UI and Accessibility

- Pages reviewed:
- States reviewed:
- Viewports:
- Browsers:
- Keyboard:
- Screen reader:
- Contrast:
- Zoom:
- Reduced motion:
- Responsive issues:
- Screenshot paths:
- Console issues:
- Network issues:

## Character Art

- Assets changed:
- Status:
- Placeholders:
- Rights:
- Originality:
- Period accuracy:
- UI integration:
- Responsive review:
- Contact-sheet review:
- Remaining issues:

## Security

- Authentication:
- Authorization:
- RLS:
- Cross-user tests:
- Save ownership:
- Hidden state:
- Atomicity:
- Revision:
- Idempotency:
- Storage:
- Secrets:
- Logging:
- Abuse controls:
- Negative tests:
- Remaining risks:

## Database and Migrations

- Migrations:
- Existing-data impact:
- Save impact:
- RLS impact:
- Backup:
- Dry run:
- Staging result:
- Rollback or recovery:
- Post-migration validation:

## Environment and Deployment

- Required variables:
- Missing variables:
- Public variables:
- Server secrets:
- Target project:
- Target environment:
- Build artifact:
- Deployment authorization:
- Monitoring:
- Logs:
- Domain or redirects:
- Deployment result:

## Performance and Reliability

- Budgets:
- Measurements:
- Regressions:
- Large-save behavior:
- Slow-network behavior:
- Third-party failure:
- Retry behavior:
- Timeouts:
- Remaining risks:

## Rollback Plan

- Trigger:
- Decision owner:
- Previous known-good version:
- Application rollback:
- Content rollback:
- Database recovery:
- Asset rollback:
- Secret rotation:
- Validation after rollback:

## Post-Deployment Checks

- Availability:
- Navigation:
- Authentication:
- New game:
- Save:
- Choice resolution:
- Content:
- Assets:
- Database:
- Authorization:
- Errors:
- Performance:
- Monitoring:

## Blocking Issues

For each blocker:

- ID:
- Gate:
- Severity:
- Description:
- Evidence:
- Required correction:
- Related skill:
- Owner:
- Retest requirement:

## Accepted Warnings

For each warning:

- ID:
- Description:
- Impact:
- Likelihood:
- Mitigation:
- Acceptance owner:
- Follow-up:
- Expiration:

## Checks Not Executed

For each check:

- Check:
- Reason:
- Impact:
- Required before production:
- Owner:

## Known Risks

For each risk:

- Risk:
- Severity:
- Likelihood:
- Impact:
- Mitigation:
- Monitoring:
- Owner:

## Final Decision

Choose exactly one:

- Approved
- Approved with accepted warnings
- Blocked
- Incomplete evaluation

- Decision:
- Reason:
- Decision owner:
- Date:
- Conditions:
- Required follow-up:

Never select Approved when a required gate failed, a production blocker remains, required evidence is missing, or a required gate was not evaluated.
