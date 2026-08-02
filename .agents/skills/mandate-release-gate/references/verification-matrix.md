# Release Verification Matrix

## Contents

- [Gate Matrix](#gate-matrix)
- [Environment Matrix](#environment-matrix)
- [Actor and Security Matrix](#actor-and-security-matrix)
- [UI Viewport Matrix](#ui-viewport-matrix)
- [Player-Flow Matrix](#player-flow-matrix)
- [Content Matrix](#content-matrix)
- [Evidence Matrix](#evidence-matrix)

Use these matrices as scope-aware templates. Replace conceptual requirements with actual project commands, environments, expected behavior, and evidence. Do not claim every row always applies.

## Gate Matrix

Use `Required`, `Conditional`, or `Not applicable` during planning; replace the final status with an allowed gate status after execution.

| Gate | Low risk | Medium risk | High risk | Critical risk | Related skill | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Repository status | Required | Required | Required | Required | release gate | Git output | Not evaluated |
| Change review | Required | Required | Required | Required | scope specialists | Diff/review | Not evaluated |
| Dependency integrity | Conditional | Required | Required | Required | release gate | Lockfile/install check | Not evaluated |
| Type checking | Conditional | Required | Required | Required | page/game/security | Command output | Not evaluated |
| Lint | Conditional | Required | Required | Required | scope specialists | Command output | Not evaluated |
| Production build | Conditional | Required | Required | Required | release gate | Build artifact/log | Not evaluated |
| Unit tests | Conditional | Required | Required | Required | scope specialists | Test report | Not evaluated |
| Integration tests | Conditional | Conditional | Required | Required | scope specialists | Test report | Not evaluated |
| End-to-end tests | Conditional | Conditional | Required | Required | page/UI/security | Browser report | Not evaluated |
| Game-system invariants | Not applicable unless changed | Conditional | Required when changed | Required when changed | mandate-game-systems | Test report | Not evaluated |
| Deterministic replay | Not applicable unless changed | Conditional | Required when changed | Required when changed | mandate-game-systems | Fixed-seed evidence | Not evaluated |
| Save migration | Not applicable unless changed | Conditional | Required when changed | Required when changed | game/security | Migration tests | Not evaluated |
| Content validation | Conditional | Required when content changes | Required when content changes | Required when content changes | mandate-content-validator | Validation report | Not evaluated |
| Narrative continuity | Not applicable unless changed | Required when changed | Required when changed | Required when changed | mandate-narrative-author | Review report | Not evaluated |
| Accessibility | Conditional | Required for visible change | Required for visible change | Required for visible change | UI/page | axe/manual evidence | Not evaluated |
| Responsive verification | Conditional | Required for visible change | Required for visible change | Required for visible change | UI/page | Viewport matrix | Not evaluated |
| Visual screenshots | Conditional | Required for visible change | Required for visible change | Required for visible change | mandate-ui-director | Screenshot paths | Not evaluated |
| Character-art review | Not applicable unless changed | Required when changed | Required when changed | Required when changed | character art | Review/contact sheet | Not evaluated |
| Authentication | Not applicable unless affected | Conditional | Required when affected | Required when affected | Supabase security | Positive/negative tests | Not evaluated |
| Authorization | Not applicable unless affected | Conditional | Required when affected | Required when affected | Supabase security | Test matrix | Not evaluated |
| RLS | Not applicable unless affected | Conditional | Required when affected | Required when affected | Supabase security | Policy tests | Not evaluated |
| Cross-user denial | Not applicable unless affected | Conditional | Required when affected | Required when affected | Supabase security | Negative tests | Not evaluated |
| Hidden-state exposure | Conditional | Required when data changes | Required | Required | game/security | Projection tests | Not evaluated |
| Storage | Not applicable unless affected | Conditional | Required when affected | Required when affected | Supabase security | Policy/upload tests | Not evaluated |
| Secrets | Required | Required | Required | Required | Supabase security | Scan/bundle/log review | Not evaluated |
| Database migration | Not applicable unless changed | Conditional | Required when changed | Required when changed | Supabase security | Staging/migration log | Not evaluated |
| Environment variables | Conditional | Required | Required | Required | Supabase security | Validation output | Not evaluated |
| Performance | Conditional | Conditional | Required when material | Required when material | scope specialists | Measurements | Not evaluated |
| Browser verification | Conditional | Required for player impact | Required for player impact | Required for player impact | UI/page | Browser matrix | Not evaluated |
| CI | Conditional | Required | Required | Required | release gate | CI run | Not evaluated |
| Deployment configuration | Not applicable locally | Conditional | Required | Required | release/security | Config review | Not evaluated |
| Backup | Not applicable unless data risk | Conditional | Required for data risk | Required | security/release | Backup evidence | Not evaluated |
| Rollback | Revert path | Required | Required | Required | release gate | Rollback plan/test | Not evaluated |
| Post-deploy smoke test | Not applicable without deploy | Conditional | Required after deploy | Required after deploy | scope specialists | Smoke report | Not evaluated |

## Environment Matrix

| Check | Local | CI | Preview | Staging | Production | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Build | Plan/execute | Execute | Verify artifact | Verify artifact | Verify promoted artifact | Use authoritative command. |
| Unit tests | Execute | Execute | Usually reuse CI | Re-run if environment-dependent | Avoid unnecessary production execution | Record counts. |
| Integration tests | Execute where available | Execute | Conditional | Execute for high risk | Smoke only unless designed safely | Isolate test data. |
| E2E | Local browser | Execute where configured | Execute | Execute | Critical smoke | Record browsers. |
| Content validation | Execute | Execute | Verify version | Execute before publication | Verify published version | Block on errors. |
| Migration dry run | Local disposable DB | CI if supported | Isolated preview | Required for relevant risk | Never treat production as dry run | Preserve logs. |
| RLS tests | Local/test project | Execute | Isolated preview | Required when affected | Safe denial smoke | Never expose production data. |
| Browser smoke test | Local | Optional headless | Required for player impact | Required | Required after deploy | Record target. |
| Accessibility | Local | Automated | Rendered review | Required for affected flows | Critical smoke | Include manual checks. |
| Performance | Baseline | Automated budget | Preview measurement | Production-like measurement | Monitor | Do not invent budgets. |
| Deployment smoke test | Not applicable | Not applicable | After preview | After staging | After production | Verify availability and critical flows. |
| Monitoring review | Local logs | CI logs | Preview logs | Staging monitoring | Production monitoring | Keep secrets out. |

## Actor and Security Matrix

Record expected allow or deny only after the real architecture exists.

| Actor | Authentication | Save read | Save create | Save update | Save delete | Content read | Content publish | Asset upload | Administrative action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Anonymous | Decide | Decide | Decide | Decide | Decide | Decide | Decide | Decide | Decide |
| Owner player | Decide | Decide | Decide | Decide | Decide | Decide | Decide | Decide | Decide |
| Different authenticated player | Decide | Decide | Decide | Decide | Decide | Decide | Decide | Decide | Decide |
| Content editor | Decide | Decide | Decide | Decide | Decide | Decide | Decide | Decide | Decide |
| Administrator | Decide | Decide | Decide | Decide | Decide | Decide | Decide | Decide | Decide |
| Trusted service | Decide | Decide | Decide | Decide | Decide | Decide | Decide | Decide | Decide |

For each decided cell, record the authoritative rule and a positive or negative test.

## UI Viewport Matrix

| Viewport | Page | State | Browser | Screenshot | Issues | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1920 x 1080 | | | | | | Not evaluated |
| 1440 x 900 | | | | | | Not evaluated |
| 1366 x 768 | | | | | | Not evaluated |
| 1280 x 720 | | | | | | Not evaluated |
| 1024 x 768 | | | | | | Not evaluated |
| 768 x 1024 | | | | | | Not evaluated |
| 390 x 844 | | | | | | Not evaluated |

Use the project viewports required by `mandate-ui-director`. Add rows per page and state rather than overwriting evidence.

## Player-Flow Matrix

Do not claim a flow exists before implementation.

| Flow | Exists | Environment | Role | Data or scenario | Result | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Landing | | | | | | | Not evaluated |
| Registration or sign-in | | | | | | | Not evaluated |
| New-game setup | | | | | | | Not evaluated |
| Family customization | | | | | | | Not evaluated |
| First scenario | | | | | | | Not evaluated |
| Choice resolution | | | | | | | Not evaluated |
| Save creation | | | | | | | Not evaluated |
| Save loading | | | | | | | Not evaluated |
| Cabinet | | | | | | | Not evaluated |
| Parliament | | | | | | | Not evaluated |
| Economy | | | | | | | Not evaluated |
| Diplomacy | | | | | | | Not evaluated |
| Intelligence | | | | | | | Not evaluated |
| War Room | | | | | | | Not evaluated |
| Election | | | | | | | Not evaluated |
| Ending | | | | | | | Not evaluated |
| Account and sign-out | | | | | | | Not evaluated |

## Content Matrix

| Area | Command or procedure | Errors | Warnings | Evidence | Status |
| --- | --- | --- | --- | --- | --- |
| Schema | | | | | Not evaluated |
| IDs | | | | | Not evaluated |
| References | | | | | Not evaluated |
| State effects | | | | | Not evaluated |
| Eligibility | | | | | Not evaluated |
| Branching | | | | | Not evaluated |
| Reachability | | | | | Not evaluated |
| Family tokens | | | | | Not evaluated |
| Continuity | | | | | Not evaluated |
| Rating | | | | | Not evaluated |
| Assets | | | | | Not evaluated |
| Endings | | | | | Not evaluated |
| Versioning | | | | | Not evaluated |

## Evidence Matrix

| Gate ID | Command or procedure | Environment | Started | Completed | Exit code | Evidence path | Result | Warning | Blocker | Reviewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | | | | |

Use real timestamps, paths, commands, outputs, and reviewers when generating a report. Never prefill invented evidence.
