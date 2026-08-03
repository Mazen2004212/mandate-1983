# MANDATE: 1983 — MVP Progress Tracker

## 1. Current Status

- Project phase: Domain foundation implementation
- Current task: TASK-06
- Current task title: Content Schemas, Registries, and Manifest
- Current task status: `ready_for_review`
- Current branch: `main`
- Foundation baseline commit: `6979c02`
- Latest verified baseline commit: `6979c02`
- Preview URL: None
- Production URL: None
- Active blocker: None
- Last progress update: TASK-05 verified at `0ba241f`; TASK-06 content contracts, registries, manifest, token validation, and reference validation are ready for review
- Implementation tasks verified: 5 / 20

TASK-01 through TASK-04 are verified and consolidated into the single canonical repository baseline commit `6979c02`. TASK-05 is verified at `0ba241f`; TASK-06 is ready for review with no implementation commit, and no preview or production deployment exists.

## 2. Task Table

| ID | Title | Phase | Status | Dependencies | Implementation commit | Verification evidence | Blocker |
|---|---|---|---|---|---|---|---|
| TASK-01 | Repository and Application Bootstrap | A | `verified` | None | `6979c02` (consolidated baseline) | Local checks passed; implementation reviewed, accepted, and consolidated | None |
| TASK-02 | Design Tokens and Application Shell | A | `verified` | TASK-01 | `6979c02` (consolidated baseline) | Visual-reference revision complete; format, lint, typecheck, 9 unit/component tests, production build, Storybook build, and 7 production-mode E2E viewport projects passed; all required screenshots inspected | None |
| TASK-03 | Domain Types and Runtime State Schemas | B | `verified` | TASK-01 | `6979c02` (consolidated baseline) | Strict domain schemas and 98 new tests passed; frozen install, format, lint, typecheck, 107-test full suite, production build, and 7-project E2E regression passed; implementation reviewed, accepted, and consolidated | None |
| TASK-04 | Deterministic Arithmetic and Seed Primitives | B | `verified` | TASK-03 | `6979c02` (consolidated baseline) | Exact arithmetic and deterministic seed primitives implemented; frozen install, format, lint, typecheck, 204-test full suite, production build, and 7-project E2E regression passed; implementation reviewed, accepted, and consolidated | None |
| TASK-05 | Initial State and Political Backgrounds | B | `verified` | TASK-04 | `0ba241f` | Complete authoritative baseline, four apply-once backgrounds, strict deterministic factory, 36 new tests, 240-test suite, production build, and 7-project E2E regression passed; implementation reviewed and accepted | None |
| TASK-06 | Content Schemas, Registries, and Manifest | B | `ready_for_review` | TASK-03 | None | Strict content contracts and immutable registry implemented; frozen install, format, lint, typecheck, 278-test suite, production build, and 7-project E2E regression passed | None |
| TASK-07 | Eligibility, Content Graphs, and Scenario Scheduler | B | `not_started` | TASK-05, TASK-06 | None | None | None |
| TASK-08 | Authoritative Mutation and Delayed-Effect Engine | B | `not_started` | TASK-05, TASK-07 | None | None | None |
| TASK-09 | Economic, Government, Faction, Region, and Outcome Calculations | B | `not_started` | TASK-04, TASK-05 | None | None | None |
| TASK-10 | Supabase Foundation, Authentication, and RLS | C | `not_started` | TASK-03 | None | None | None |
| TASK-11 | Save Repository and Server Mutation Boundary | C | `not_started` | TASK-08, TASK-10 | None | None | None |
| TASK-12 | Authentication and New-Game Player Journey | D | `not_started` | TASK-02, TASK-05, TASK-11 | None | None | None |
| TASK-13 | Office Dashboard and Save Management | D | `not_started` | TASK-02, TASK-11 | None | None | None |
| TASK-14 | Dialogue and Decision Experience | D | `not_started` | TASK-02, TASK-07, TASK-08, TASK-11 | None | None | None |
| TASK-15 | Government Workspaces | D | `not_started` | TASK-02, TASK-09, TASK-11 | None | None | None |
| TASK-16 | Prologue Production Content | E | `not_started` | TASK-06, TASK-07, TASK-08, TASK-12, TASK-14 | None | None | None |
| TASK-17 | Chapter 1 Production Content | E | `not_started` | TASK-15, TASK-16 | None | None | None |
| TASK-18 | MVP Outcomes, Epilogues, and Art Integration | E | `not_started` | TASK-09, TASK-15, TASK-17 | None | None | None |
| TASK-19 | Integrated Verification and Preview Release | F | `not_started` | TASK-01–18 | None | None | None |
| TASK-20 | Balance Review and MVP Release Candidate | F | `not_started` | TASK-19 | None | None | None |

Foundation-document commits do not count as implementation-task completion.

## 3. Current Task Workspace

The TASK-01 through TASK-04 workspace records below are historical execution evidence from before repository-history consolidation. Former short hashes are retained only as historical labels for those recorded sessions; they are not current Git objects and are not required to exist. The sole canonical current baseline is `6979c02`.

### TASK-06 Implementation Workspace Record

- Task ID: TASK-06
- Objective: Implement strict authored-content schemas, typed immutable registries, direct cross-reference validation, family-token validation, and a versioned content manifest without runtime content execution.
- Scope confirmed: Yes; limited to `src/content` and this tracker. No production content, eligibility evaluator, scheduler, graph traversal, mutation engine, delayed-effect executor, formulas, UI, Supabase, database, persistence, authentication, environment, package, lockfile, or TASK-07 implementation was added.
- Files added: `src/content/constants.ts`, `src/content/ids.ts`, `src/content/index.ts`, `src/content/registry.ts`, `src/content/tokens.ts`, seven focused schema modules under `src/content/schemas`, and `src/content/content-contracts.test.ts`.
- Architecture: Pure TypeScript and Zod with strict common metadata; scenario, beat, choice, condition, effect, conditional-effect, delayed-effect, memory, flag, entity, manifest, and token contracts; intentional public exports; no process-global mutable registry or I/O dependency.
- Lifecycle: Exact `draft`, `review`, `approved`, `published`, `deprecated`, and `withdrawn` values are reused. Published metadata requires reviewed originality and change notes; published manifests require a timestamp and release notes and reject active draft, review, approved, or withdrawn metadata objects.
- Identifiers: TASK-03 authored-ID brands are reused; bounded stable IDs were added only for beats, institutions, intelligence assertions, epilogues, outlets, and tokens. Canonical characters, factions, regions, outcomes, institutions, and outlets use closed authoritative IDs.
- Registry design: `buildContentRegistry(unknown)` strictly validates every grouped object, returns a discriminated success/failure result, sorts stable IDs for deterministic lookup, recursively freezes returned objects and maps, and never silently drops or overwrites invalid input.
- Uniqueness and references: Duplicate IDs fail locally and across registries. Direct scenario, choice, condition, effect, delayed-effect, memory, flag, media, outcome, epilogue, policy, common-related-content, and manifest references produce structured blocking issues with object ID, code, path, and message.
- Manifest: Supports `mvp-0.1.0` and `schema-1.0.0`, canonical save-version ranges, lifecycle-aware publication timestamps and notes, unique disjoint included/withdrawn IDs, externally supplied integrity metadata, object existence, lifecycle compatibility, and content-version compatibility. No checksum is calculated and nothing is published.
- Family tokens: All 12 approved tokens have immutable metadata. Extraction validates exact double-brace tokens, rejects unknown or malformed required syntax, treats single braces and markup-like text as inert strings, and performs no substitution or rendering.
- Narrow decisions: Authored effect magnitude is structurally classified as `unclassified` because no authoritative per-effect magnitude budget exists. Direct self-references and in-scenario beat references are checked; graph cycles, reachability, contradiction solving, scheduling, evaluation, and execution remain TASK-07 or later work.
- Production-content confirmation: Test prose and records are neutral, explicitly test-only fixtures kept in a test module and are not exported. No Prologue, Chapter 1, decision, dialogue, article, law, intelligence report, outcome prose, epilogue prose, or production manifest was authored.
- Tests added: 38 deterministic tests covering metadata/lifecycle, scenarios/beats/choices, conditions, effects, delayed effects, memories, flags, family tokens, canonical entities, manifest rules, duplicates, global collisions, direct references, deterministic lookup, immutability, and precise issue paths.
- Baseline evidence: `pnpm install --frozen-lockfile`, format, lint, typecheck, 240-test suite, and production build passed before implementation at HEAD `0ba241f`.
- Final evidence: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, 278 tests across 11 files, production build, and all 7 Playwright projects passed. The build-generated `next-env.d.ts` route-type change was restored and is not part of TASK-06.
- Implementation commit: None; changes are intentionally unstaged and uncommitted.

### TASK-05 Implementation Workspace Record

- Task ID: TASK-05
- Objective: Implement the complete authoritative provisional MVP baseline, four political-background modifier definitions, apply-once protection, and a pure deterministic new-game save factory.
- Scope confirmed: Yes; limited to TASK-05. No content registry, scenario, scheduler, mutation engine, period formula, persistence, Supabase, authentication, database, migration, production content, or UI work was started.
- Initial Git status: Clean on `main` at actual canonical HEAD `5669f68`, tracking `origin/main`. The prompt's literal HEAD placeholder was resolved from the repository; the commit contains the reviewed `MVP Initial State Completion Decisions`. TASK-01 through TASK-04 were verified and TASK-05 was `not_started`.
- Baseline verification: `pnpm install --frozen-lockfile`, `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` passed before editing; 9 files and 204 tests passed. The build-generated `next-env.d.ts` route-reference change was restored.
- Files changed: Added focused initialization constants, fresh-state factory, immutable background definitions, apply-once workflow and errors, strict new-game input/save factory, and 36 deterministic tests under `src/domain/initialization`; updated the intentional `src/domain/index.ts` export surface and this tracker only.
- Baseline authority: Section 31 explicit economy, government, security, international, family, faction, and regional values take precedence. `MVP Initial State Completion Decisions` supplies only previously omitted values, collections, metadata, relationship defaults, empty root domains, and schema-compatible cabinet, red-line, and outcome representations.
- Money and units: VRC baseline amounts convert exactly to BigInt Crown cents: treasury `4800000000n`, revenue `1220000000n`, expenditure `1380000000n`, debt service `140000000n`, arrears `240000000n`, and all three omitted period-flow fields `0n`. Basis points and normalized scores remain exact integers.
- Background definitions: The exact four stable IDs have 21 immutable modifier entries and no labels, prose, ideology, recurring effects, eligibility, or undocumented benefits. Every definition has at least one documented positive and negative effect, unique complete field/delta sets, and schema-valid canonical targets.
- Apply-once design: The public `createNewGame` API owns baseline creation plus one selected-background application. An internal initialization draft carries an explicit nullable applied-background marker outside authoritative state; a second application throws `DuplicatePoliticalBackgroundError`, and a mismatched selection throws `PoliticalBackgroundMismatchError`. No object identity, process-global registry, silent idempotency, or persistent marker is used.
- Modifier behavior: Only immutable definition targets can change. Normalized-score changes use TASK-04 `clamp100`, final state is reparsed through the strict root schema, unknown public background IDs fail input validation, and fixed tests prove both upper and lower clamping.
- Determinism and seed: All IDs, timestamps, versions, family identity, selected background, and seed are validated explicit inputs. No time, UUID, direct-random, Node-random, environment, request-order, or render dependency exists. Equal complete inputs produce deeply equal saves; retries do not reroll. The stored seed does not alter fixed initial values.
- Versions and metadata: Save `save-1.0.0`, schema `schema-1.0.0`, and content `mvp-0.1.0` are closed input literals; revision is `0`, political period is `0`, and difficulty is `standard`. Unsupported versions and extra fields fail. Explicit timestamps must be valid and `updatedAt` cannot precede `createdAt`.
- Validation and tests: Every final result passes `authoritativeSaveSchema`. The 36 new tests cover the complete root inventory, exact money/basis-point/normalized values, every canonical entity and collection, independent object graphs, all exact definitions and final values, no unrelated changes, clamping, apply-once and mismatch errors, validation failures, version closure, metadata preservation, deterministic retry, and fixed seed behavior.
- Structural trade-off review: Every background is structurally differentiated and contains its documented advantages and disadvantages. Balance status: `Structurally differentiated; balance unmeasured`. No value was adjusted to force symmetry.
- Content validation: Stable background IDs resolve through the existing closed enum; definition targets are a closed TypeScript union over existing TASK-03 fields and canonical entities. No authored scenario, manifest, reference graph, production prose, family token, media, asset, or publication object was introduced, so those content-publication checks are not applicable.
- Verification executed: Final `pnpm install --frozen-lockfile`, `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm test:e2e` passed. Final unit result was 10 files and 240 tests; E2E passed all 7 existing production-mode Chromium viewport projects.
- Scope and integrity: Direct-randomness, UUID, time-read, React, Next.js, browser API, suppression, broad-`any`, unsafe-cast, secret, dependency, Supabase, SQL/migration, UI/configuration, authoritative-document, skill, premature TASK-06 through TASK-09, staged-change, generated-artifact, and nested-`.git` checks found no relevant violation. Both build-generated `next-env.d.ts` changes were restored.
- Findings corrected: Initial implementation typecheck found a duplicate content-version export, missing canonical key aliases, and incompatible Zod literal pipelines; later test typechecks caught a FlagId/MemoryId mismatch and an unbranded family-name mutation. Each was corrected without weakening production schemas. One scan command had a PowerShell quoting failure; it was rerun with safe patterns and passed.
- Persistence and migration impact: None. The task creates versioned in-memory authoritative saves only; no repository, database, serialization transport, migration, ownership query, or browser projection was added.
- Known limitations: Initialization only. The factory does not persist saves, generate inputs, schedule or resolve content, mutate an existing save, execute delayed effects, advance periods, calculate formulas, simulate balance, or expose a UI.
- Rollback: Revert the unstaged TASK-05 initialization directory, domain export, and tracker change before downstream work. No published save or migration depends on this workspace.
- Implementation commit: None.
- Review decision: Ready for review

### TASK-05 Specification Completion Workspace Record

- Task ID: TASK-05
- Objective: Complete the authoritative provisional MVP initial-state specification without implementing TASK-05 source code.
- Scope confirmed: Yes; limited to `docs/SYSTEMS_DESIGN.md` and this tracker. TASK-05 code and TASK-06 or later content, scheduling, mutation, formula, persistence, and UI work were not started.
- Repository state: The prior TASK-05 implementation attempt began clean on `main` at required HEAD `2a9a9d4`. This specification-completion session inherited only the expected unstaged blocked-session update to `docs/PROGRESS.md`; no source change was present.
- Prior verification: The blocked implementation session passed `pnpm install --frozen-lockfile`, `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm test:e2e`; 9 files and 204 unit tests plus all 7 configured E2E viewport projects passed. Each build-generated `next-env.d.ts` route-reference change was restored.
- Authority confirmed: `SYSTEMS_DESIGN.md` supplies political period `0`, Standard difficulty, fixed baseline values for the listed economy, government, security, international, family, three-faction, and four-region fields, and the exact four background modifier sets with apply-once and clamp-after-application requirements. `CONTENT_ARCHITECTURE.md` supplies content version `mvp-0.1.0`.
- Prior blocking gaps: The initial authority audit found missing numeric fields, relationship scores, collection contents, cabinet membership, starting revision, and supported save/schema versions. No source implementation was attempted while those decisions were absent.
- Specification completion: `SYSTEMS_DESIGN.md` now defines revision `0`; versions `save-1.0.0`, `schema-1.0.0`, and `mvp-0.1.0`; period `0`; Standard difficulty; every previously omitted numeric field; every required relationship default; character, faction, region, family, cabinet, collection, empty-domain, and outcome initialization rule; explicit-input metadata; and fixed-seed behavior.
- Contract reconciliation: Zero red-line violations is represented by the existing empty violation-ID collection, zero cabinet members by the existing empty cabinet ID collection, and the semantic null outcome by the TASK-03 unresolved `outcomeState: {}` representation. These decisions add no competing runtime field.
- Authority decision: Existing explicit section 31 values take precedence. Neutral values fill only previously omitted required fields. The completed values are provisional MVP balance and require explicit version review before later changes.
- Background review: The four documented modifier definitions remain complete and structurally distinct. The completed baseline now permits a future TASK-05 implementation to apply them without inventing omitted state. Balance remains `Structurally differentiated; balance unmeasured`.
- Files changed: `docs/SYSTEMS_DESIGN.md` and `docs/PROGRESS.md` only. No source, schema, test, UI, configuration, dependency, content, database, Supabase, SQL, migration, environment, or skill file changed.
- Current verification: `pnpm format:check` and `git diff --check` passed; the complete two-document diff was inspected; final status contains only the two authorized documentation files.
- Blocker resolution: Completed by the authoritative `MVP Initial State Completion Decisions` section. Every current TASK-03 root-state field now has an initialization rule, the active blocker is removed, and TASK-05 returns to `not_started` pending a separate implementation request.
- Review decision: Ready for review

### TASK-04 Historical Completed Workspace Record

- Task ID: TASK-04
- Objective: Implement canonical safe-integer arithmetic and versioned deterministic seeded-variation primitives for later game-system calculations.
- Scope confirmed: Yes; limited to TASK-04. TASK-05 initial state and background modifiers and all later formulas, mutations, persistence, content, and UI work were not started.
- Initial Git status: Clean on `main` at required HEAD `710dd88`; `.git`, TASK-03 commit `710dd88`, TASK-02 commit `3fce51f`, and TASK-01 commit `0058b60` confirmed.
- Files expected: Focused `src/domain/arithmetic` and `src/domain/random` primitives and tests, intentional `src/domain/index.ts` exports, and this tracker update.
- Files changed: New arithmetic and deterministic-random modules and tests, `src/domain/index.ts`, and `docs/PROGRESS.md`. No existing state schema, application, UI, content, persistence, environment, Supabase, SQL, migration, configuration, skill, or authoritative design-document file changed.
- Commands executed: Complete governing-document and three-skill preflight; clean-tree and commit verification; baseline and final `pnpm install --frozen-lockfile`, `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`; final `pnpm test:e2e`; dependency, direct-randomness, premature-formula, suppression, unsafe-cast, secret-pattern, nested-Git, generated-output, changed-file, UI-integrity, and Git-integrity scans.
- Tests executed: `pnpm test` passed 9 files and 204 tests, including 97 new TASK-04 tests for clamps, approach, half-away-from-zero number/BigInt rounding parity, weighted averages, invalid and overflow inputs, seed validation and serialization, UTF-8 FNV-1a vectors, SplitMix64 vectors, unsigned hexadecimal output, stream separation, inclusive ranges, negative and single-value ranges, real rejection sampling, retry stability, variation bounds, explanation integrity, state immutability, and public-summary exclusion. `pnpm test:e2e` passed all 7 existing viewport projects.
- Arithmetic decisions: Number helpers reject every non-finite, fractional, and unsafe integer. `clamp` uses inclusive bounds; `clampBigInt` preserves exact BigInt values without mixed-type coercion; `clamp100` delegates to `clamp`. `approach` computes its delta in BigInt to avoid safe-number subtraction overflow and never overshoots. Weighted averages require positive safe-integer weights, reject empty input, use exact BigInt intermediates to detect product/running-total/weight-total overflow, and do not clamp automatically.
- Rounding behavior: `roundNearest` validates safe integers and delegates to exact BigInt quotient/remainder logic. Exact halves round away from zero symmetrically; denominator zero or negative is rejected. The BigInt implementation supports values beyond the Number safe range without floating-point division or `Math.round`.
- Canonical seed serialization: `mandate_seed_v1` fixes the field order `gameSeed`, `namespace`, `entityId`, `politicalPeriod`, `attemptIndex`, and `contentVersion`. Each value is explicitly named and UTF-8-byte-length-prefixed, numeric fields use locale-independent base-10 strings, and no JSON ordering, timestamps, whitespace formatting, or object identity participates.
- Hash and sample algorithm: `mandate_rng_v1_fnv1a64_utf8_splitmix64` hashes the canonical context with documented FNV-1a 64-bit offset `14695981039346656037` and prime `1099511628211`, masking after each multiplication. A self-contained deterministic UTF-8 encoder handles non-ASCII vectors. Stateless SplitMix64 derives samples from the context hash and stable sample index with exact unsigned-64-bit BigInt masking. The algorithm is explicitly non-cryptographic and version changes are save-outcome-affecting.
- Rejection sampling: Inclusive bounded integers support negative ranges and at most `Number.MAX_SAFE_INTEGER` distinct outcomes. Samples at or above the largest accepted multiple below `2^64` are rejected, and stable sequential indexes are tried with an explicit 128-attempt safety cap. A fixed fixture exercises one actual rejection before acceptance, proving that the modulo-bias path is tested.
- Developer explanations: Results include developer-only algorithm/serialization versions, canonical context, namespace, entity, period, attempt, content version, requested and accepted sample indexes, requested range, unsigned hexadecimal context hash and sample, rejection count, result, and a non-cryptographic classification. Nothing connects explanations to UI or public save summaries.
- Browser and UI checks: Existing page and component sources were unchanged. All seven production-mode E2E viewport projects passed; no arithmetic values, seed details, statistics, or debug interface were added to the browser.
- Content and security checks: No authored or production content, initial state, background modifier, database, Supabase, environment variable, secret, SQL, migration, or Node random API was introduced. Stable seed namespace and entity boundaries reuse TASK-03 authored-ID and version schemas.
- Findings: The first test typecheck exposed overly narrow literal types in context fixtures and an excessive test range; both test fixtures were corrected without weakening production contracts. The first formatter check identified new-file formatting and passed after formatting. Baseline and final builds regenerated `next-env.d.ts`; the generated route-reference change was restored and is excluded from TASK-04.
- Known limitations: These primitives do not generate a game seed, apply variation, calculate production state, resolve outcomes, schedule events, mutate saves, migrate persistence, or expose a UI. The deterministic algorithm is simulation-only and not cryptographically secure.
- Blockers: None.
- Required follow-up: Review TASK-04 and create an implementation commit only if approved; do not begin TASK-05 in this session.
- Proposed commit message: `feat: add deterministic arithmetic and seed primitives`
- Final Git status: TASK-04 source, tests, exports, and tracker changes remain unstaged; no unrelated or generated file change, commit, or push was created.
- Review decision: Ready for review

### TASK-03 Historical Completed Workspace Record

- Task ID: TASK-03
- Objective: Translate the authoritative MVP state domains, identifiers, numeric units, family identity, version boundaries, root game state, and save contracts into strict TypeScript and Zod schemas.
- Scope confirmed: Yes; limited to TASK-03. TASK-04 arithmetic and deterministic-seed primitives were not started.
- Initial Git status: Clean on `main` at required HEAD `3fce51f`; `.git`, amended TASK-02 commit `3fce51f`, and TASK-01 commit `0058b60` confirmed.
- Files expected: Modular `src/domain` constants, IDs, common/state/save schemas, intentional public exports, test-only fixtures, domain tests, and this tracker update.
- Files changed: New `src/domain` implementation and tests plus `docs/PROGRESS.md`. No application, UI, content definition, persistence, environment, Supabase, SQL, migration, configuration, skill, or authoritative design-document file changed.
- Commands executed: Complete governing-document and four-skill preflight; clean-tree and commit verification; baseline `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`; final `pnpm install --frozen-lockfile`, `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm test:e2e`; dependency, randomness, suppression, secret-pattern, nested-Git, generated-output, scope, and Git-integrity scans.
- Tests executed: `pnpm test` passed 7 files and 107 tests, including 98 new domain tests for numeric boundaries, exact BigInt money conversion, IDs, enums, family names and roles, versions, timestamps, every root domain, state-specific limits, memories, delayed effects, authoritative saves, strict unknown-field rejection, and public-safe save summaries. `pnpm test:e2e` passed all 7 existing viewport projects.
- Manual checks: No player-facing UI changed, so new screenshots or visual review were not applicable. The existing rendered-browser regression remained green.
- Browser checks: Existing production-mode Playwright coverage passed at all seven configured viewports; TASK-03 adds no browser code or browser-exposed hidden state.
- Security checks: Save and user IDs validate as UUIDs for future ownership boundaries; authoritative saves and public summaries are separate strict schemas. Scans found no React, Next.js, browser API, environment-client, database, PostgreSQL, Supabase, credential, broad-`any`, suppression, or direct-randomness dependency in `src/domain`.
- Content checks: Stable authored IDs, canonical entity IDs, lifecycle, visibility, character availability, delayed-effect status, and version values are closed and validated. No authored scenario, registry, production content, or content publication was introduced.
- Numeric and money decisions: Runtime money is exact signed-64-bit `bigint` (`-2^63..2^63-1`); serialization uses canonical base-10 integer strings and converter-only parse/serialize helpers. No floating-point money, arithmetic formulas, display formatting, or undocumented numeric coercion was added. General basis points remain integral; domain-specific documented ranges are enforced. Political periods are limited to MVP periods `0..6`.
- Boundary decisions: `SYSTEMS_DESIGN.md` controls state units, so international relations, family trust, and relationship dimensions use `NormalizedScore`; directional memory weights use `SignedWeight`. Save/user IDs are UUIDs, while authored definitions use branded lowercase ASCII snake-case IDs. Names support Unicode, spaces, apostrophes, hyphens, and inert markup-like text up to 64 characters while rejecting empty, control, format, and edge-whitespace input. Root `national` and `debugMetadata` remain strict empty contracts because TASK-03 authority names those domains without defining fields; this prevents silent state invention.
- Findings: The initial strict-type check exposed a Zod canonical-enum pipeline input mismatch and was corrected with validated transforms. The first formatter check identified new-file formatting and passed after formatting. Baseline and final Next builds regenerated the tracked route-reference line in `next-env.d.ts`; it was restored each time and is not part of TASK-03.
- Blockers: None.
- Required follow-up: Review TASK-03 and create an implementation commit only if approved; do not begin TASK-04 in this session.
- Proposed commit message: `feat: add domain state and save schemas`
- Final Git status: TASK-03 source, tests, and tracker changes remain unstaged; no unrelated or generated file change, commit, or push was created.
- Review decision: Ready for review

### TASK-02 Historical Completed Workspace Record

- Task ID: TASK-02
- Objective: Establish the design-token system, reusable application shell, state primitives, and a truthful premium presidential-office foundation page.
- Scope confirmed: Yes; limited to TASK-02.
- Initial Git status: Clean on `main` at `0058b60`.
- Files expected: Global styles and tokens; application shell and TASK-02 primitives; foundation page, stories, unit/component tests, E2E tests, and this TASK-02 tracker update.
- Files changed: TASK-02 application shell, semantic design tokens and global styles, truthful foundation page, reusable UI primitives, Storybook stories, unit/component tests, production-mode Playwright coverage, and this TASK-02 tracker record. The visual-reference revision added the structural office index, layered dossier workspace, contextual status rail, integrated boundary notice, original CSS/SVG ornament, and responsive shell transformations. The superseded TASK-01 foundation-status component and story were removed.
- Commands executed: Preflight and baseline `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`; final `pnpm install --frozen-lockfile`, `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm build-storybook`, and `pnpm test:e2e`; Git integrity, scope, generated-output, and credential-pattern checks.
- Tests executed: `pnpm test` passed 2 files and 9 tests; `pnpm test:e2e` passed 7 Chromium projects at 1920x1080, 1440x900, 1366x768, 1280x720, 1024x768, 768x1024, and 390x844.
- Manual checks: All seven production-mode full-page screenshots inspected, including the required 390x844, 768x1024, 1440x900, and 1920x1080 captures. Office-shell composition, dossier depth, tabs, clip, seal and stamp placement, compact information density, desktop side rails, tablet bands, mobile stacking, text legibility, and absence of clipping or development overlays were reviewed.
- Browser checks: The final production build was started and exercised in real Chromium through Playwright at seven viewport sizes. Title, H1, one main landmark, keyboard order, visible focus, zero fake buttons, no horizontal overflow, zero console errors, zero failed requests, and zero HTTP error responses were confirmed; the local server stopped afterward.
- Security checks: No authentication, persistence, database, migration, environment variable, remote asset, or secret work was introduced. Credential-pattern scan found no secrets in changed TASK-02 files.
- Accessibility checks: Axe found no serious or critical violations in all seven E2E projects. Skip-link and text-link keyboard focus, visible outlines, semantic landmarks, one H1, non-color-only status treatments, reduced-motion transition duration, mobile overflow, and 200% text scaling were tested.
- Content checks: No production content is in scope.
- Findings: Clean baseline at `0058b60`. During implementation, strict typing exposed a React-node condition, component tests exposed missing DOM cleanup, and reduced-motion testing exposed Chromium duration normalization; each was fixed. Live-browser review found a two-pixel mobile root overflow, development-overlay contamination in dev-mode screenshots, and a 200% text-scaling title/header defect; production-mode E2E, root clipping, responsive header wrapping, and zoom-safe title sizing resolved them. During the visual-reference revision, strict typing required explicit current-state data, an E2E text selector was made exact, and axe found a 3.81:1 copper-tab contrast failure; the tab was revised to burgundy with cream text and the final seven-project suite passed. Storybook retains a non-blocking workbench chunk-size advisory.
- Blockers: None.
- Required follow-up: User review and an implementation commit only if approved; do not begin TASK-03 in this session.
- Proposed commit message: `feat: establish Mandate design system and application shell`
- Final Git status: TASK-02 changes are unstaged; no unrelated files, generated build output, authoritative-document changes, skill changes, commit, or push detected.
- Review decision: Ready for review

TASK-02 screenshot evidence:

- `test-results/foundation-foundation-page-19907-ble-and-visually-reviewable-wide-1920x1080/foundation-page.png`
- `test-results/foundation-foundation-page-19907-ble-and-visually-reviewable-desktop-1440x900/foundation-page.png`
- `test-results/foundation-foundation-page-19907-ble-and-visually-reviewable-desktop-1366x768/foundation-page.png`
- `test-results/foundation-foundation-page-19907-ble-and-visually-reviewable-desktop-1280x720/foundation-page.png`
- `test-results/foundation-foundation-page-19907-ble-and-visually-reviewable-tablet-1024x768/foundation-page.png`
- `test-results/foundation-foundation-page-19907-ble-and-visually-reviewable-tablet-768x1024/foundation-page.png`
- `test-results/foundation-foundation-page-19907-ble-and-visually-reviewable-mobile-390x844/foundation-page.png`

### TASK-01 Historical Completed Workspace Record

- Task ID: TASK-01
- Objective: Initialize the real application foundation.
- Scope confirmed: Yes; limited to TASK-01.
- Initial Git status: Clean on `main` at `7899495`.
- Files expected: Root application and tool configuration; `src/app`, `src/components`, `src/content`, `src/domain`, `src/lib`, `src/server`, `src/styles`, `src/test`, `e2e`, `public`, CI workflow, lockfile, and this TASK-01 tracker update.
- Files changed: TASK-01 application foundation files plus `docs/PROGRESS.md`; no other authoritative document changed.
- Commands executed: Environment and Git preflight; registry version and peer-range checks; lockfile generation; frozen installs; formatter, linter, type-checker, unit test, production build, Storybook build, Playwright browser install, E2E tests, dependency audit, secret scan, and Git integrity checks.
- Tests executed: `pnpm test` — 1 file and 1 test passed; `pnpm test:e2e` — 3 Chromium viewport projects passed.
- Manual checks: Desktop, tablet, and mobile screenshots inspected; content is honest and layout remains readable without clipping.
- Browser checks: Live `http://127.0.0.1:3000/` opened in the in-app browser; title, English language, H1, no horizontal overflow, and empty warning/error console verified; local server stopped afterward.
- Security checks: Only `.env.example` exists; credential-pattern scan found no values; `pnpm audit --prod --audit-level high` reports no known vulnerabilities after narrow patched transitive overrides.
- Accessibility checks: Axe reported no serious or critical violations across desktop, tablet, and mobile; semantic landmark, region, heading, terms, and definitions inspected. No player interaction exists, so focus-state verification is not applicable.
- Content checks: None
- Findings: Repository baseline was clean; Node.js 22.15.0, Corepack 0.32.0, pnpm 11.9.0, and Git 2.50.1.windows.1 are available. Initial dependency download timed out once; a retry completed. pnpm build-script review was resolved with explicit allow-list entries. Initial transitive audit findings were resolved with narrow Next.js dependency overrides and the full local suite was rerun successfully. Storybook emits a non-blocking workbench bundle-size advisory.
- Blockers: None
- Required follow-up: Review TASK-01 and create the proposed implementation commit only if approved; do not begin TASK-02 in this session.
- Proposed commit message: `chore: initialize Mandate application foundation`
- Final Git status: TASK-01 changes are unstaged; no unrelated changes detected.
- Review decision: Ready for review

## 4. Evidence Log

The rows below preserve historical command and acceptance evidence. Any pre-consolidation commit hash is historical context only; current repository history is represented by baseline `6979c02`.

| Date or session | Task ID | Evidence type | Command or procedure | Environment | Result | Artifact or path | Reviewed by | Notes |
|---|---|---|---|---|---|---|---|---|
| 2026-08-02 | TASK-01 | Preflight | Repository root, `.git`, branch, log, and initial `git status --short --untracked-files=all` | Local Windows | Passed; initial status clean on `main` at `7899495` | Repository root | Codex | Authoritative documents and all applicable skills read before implementation. |
| 2026-08-02 | TASK-01 | Dependency install | `pnpm install --frozen-lockfile` | Node 22.15.0 / pnpm 11.9.0 | Initial download timed out; retry identified unreviewed build scripts; final run passed after explicit review and compatible peer selection | `pnpm-lock.yaml`, `pnpm-workspace.yaml` | Codex | Failure history preserved; final frozen install passed. |
| 2026-08-02 | TASK-01 | Static verification | `pnpm format:check`; `pnpm lint`; `pnpm typecheck` | Local Windows | Passed | Application and tooling files | Codex | Governance docs and skills are formatter-excluded. |
| 2026-08-02 | TASK-01 | Unit test | `pnpm test` | Vitest 4.1.10 / jsdom | Passed: 1 file, 1 test | `src/app/page.test.tsx` | Codex | Verifies honest foundation messaging and no fake action. |
| 2026-08-02 | TASK-01 | Builds | `pnpm build`; `pnpm build-storybook` | Next.js 16.2.12 / Storybook 10.5.5 | Passed | `.next`, `storybook-static` (ignored generated output) | Codex | Storybook reports a non-blocking chunk-size advisory. |
| 2026-08-02 | TASK-01 | Browser and accessibility | `pnpm test:e2e` with desktop, tablet, and mobile Chromium projects | Playwright 1.62.1 / axe 4.12.1 | Passed: 3 tests; no serious or critical axe violations, console errors, or failed requests | `test-results/**/foundation-page.png` | Codex | All three screenshots visually inspected. |
| 2026-08-02 | TASK-01 | Live browser inspection | Opened local app in in-app browser; inspected DOM, title, viewport overflow, and console; stopped server | Local dev server | Passed | `http://127.0.0.1:3000/` during verification only | Codex | No URL claimed as deployed. |
| 2026-08-02 | TASK-01 | Security | `pnpm audit --prod --audit-level high`; environment-file and credential-pattern scans | Local dependency graph | Initial audit found four transitive findings; narrow overrides applied; final audit passed with no known vulnerabilities; no secrets found | `.env.example`, `pnpm-workspace.yaml` | Codex | No Supabase connection, credentials, SQL, or remote resources introduced. |
| 2026-08-02 | TASK-02 | Preflight and baseline | Repository root, `.git`, complete governing documents and skill references, tree, clean status, `git log -2 --oneline`; baseline format, lint, typecheck, unit test, and build | Local Windows | Passed at required HEAD `0058b60` | Repository root | Codex | TASK-01 remained `ready_for_review`; verified count remained `0 / 20`. |
| 2026-08-02 | TASK-02 | Dependency and static verification | `pnpm install --frozen-lockfile`; `pnpm format:check`; `pnpm lint`; `pnpm typecheck` | Node 22.15.0 / pnpm 11.9.0 | Passed | TASK-02 source files | Codex | Frozen install was already up to date. |
| 2026-08-02 | TASK-02 | Unit and component tests | `pnpm test` | Vitest 4.1.10 / jsdom | Passed: 2 files, 9 tests | `src/app/page.test.tsx`, `src/components/design-system.test.tsx` | Codex | Covers truthful messaging, landmarks, accessible primitives, disabled/loading behavior, and long text. |
| 2026-08-02 | TASK-02 | Builds | `pnpm build`; `pnpm build-storybook` | Next.js 16.2.12 / Storybook 10.5.5 | Passed | `.next`, `storybook-static` (ignored generated output) | Codex | Storybook emitted a non-blocking workbench chunk-size advisory. |
| 2026-08-02 | TASK-02 | Production browser, accessibility, and visual-reference review | Inspected all four TASK-02 visual references; revised the shell; ran `pnpm test:e2e`; inspected production Chromium captures | Playwright 1.62.1 / axe 4.12.1 | Passed: 7 viewport projects; no serious/critical axe violations, console errors, failed requests, HTTP error responses, false gameplay claims, reference-image rendering, or horizontal overflow | `test-results/**/foundation-page.png` | Codex | All seven screenshots inspected, including 390x844, 768x1024, 1440x900, and 1920x1080; keyboard focus, reduced motion, and 200% text scaling passed. The initial copper-tab contrast failure was fixed and the complete suite rerun. |
| 2026-08-02 | TASK-02 | Scope and integrity | `git status --short --untracked-files=all`; `git diff --stat`; `git diff --check`; authoritative-document/skill diff, generated-output, and credential-pattern scans | Local Git worktree | Passed | TASK-02 files and `docs/PROGRESS.md` only | Codex | Changes remain unstaged; no commit or push was created. |
| 2026-08-03 | TASK-03 | Preflight and baseline | Repository root, `.git`, complete governing documents and four activated skills, tree, clean status, `git log -3 --oneline`; baseline format, lint, typecheck, 9-test suite, and production build | Local Windows | Passed at required amended HEAD `3fce51f` | Repository root | Codex | TASK-01 and TASK-02 commits confirmed; Next-generated route-reference change restored after build. |
| 2026-08-03 | TASK-03 | Domain contracts and tests | Strict TypeScript/Zod implementation; `pnpm format:check`; `pnpm lint`; `pnpm typecheck`; `pnpm test` | TypeScript 5.9.3 / Zod 4.4.3 / Vitest 4.1.10 | Passed: 7 files and 107 tests | `src/domain/**` | Codex | Includes 98 new domain tests; initial type-composition and formatting findings were corrected and final checks passed. |
| 2026-08-03 | TASK-03 | Build and browser regression | `pnpm build`; `pnpm test:e2e` | Next.js 16.2.12 / Playwright 1.62.1 | Passed: production build and 7 viewport projects | Existing foundation application and `e2e/foundation.spec.ts` | Codex | No visible UI changed; no new screenshot evidence required. |
| 2026-08-03 | TASK-03 | Scope and integrity | Dependency, direct-randomness, suppression, broad-`any`, credential-pattern, nested-Git, generated-output, changed-file, `git diff --check`, and status scans | Local Git worktree | Passed | TASK-03 domain files, tests, and `docs/PROGRESS.md` only | Codex | No React, Next, browser, env, database, Supabase, TASK-04, staging, commit, or push. |
| 2026-08-03 | TASK-04 | Preflight and baseline | Repository root, `.git`, complete governing documents and three activated skills, complete domain tree, clean status, `git log -3 --oneline`; frozen install, format, lint, typecheck, 107-test suite, and production build | Local Windows | Passed at required HEAD `710dd88` | Repository root | Codex | TASK-01 through TASK-03 commits confirmed; Next-generated route-reference change restored after build. |
| 2026-08-03 | TASK-04 | Arithmetic and deterministic-seed tests | Fixed safe-integer, BigInt, hash, sample, rejection, variation, and explanation fixtures; `pnpm format:check`; `pnpm lint`; `pnpm typecheck`; `pnpm test` | TypeScript 5.9.3 / Zod 4.4.3 / Vitest 4.1.10 | Passed: 9 files and 204 tests | `src/domain/arithmetic/**`, `src/domain/random/**` | Codex | Includes 97 new TASK-04 tests; initial fixture typing and formatting findings were corrected and final checks passed. |
| 2026-08-03 | TASK-04 | Build and browser regression | `pnpm build`; `pnpm test:e2e` | Next.js 16.2.12 / Playwright 1.62.1 | Passed: production build and 7 viewport projects | Existing foundation application and `e2e/foundation.spec.ts` | Codex | No visible UI changed; existing browser surface remained green. |
| 2026-08-03 | TASK-04 | Scope and integrity | Direct-randomness, dependency, premature-formula, suppression, unsafe-cast, credential, nested-Git, generated-output, changed-file, UI-integrity, `git diff --check`, and status scans | Local Git worktree | Passed | TASK-04 domain files, `src/domain/index.ts`, and `docs/PROGRESS.md` only | Codex | No TASK-05, production formula, content, persistence, UI, staging, commit, or push. |
| 2026-08-03 | TASK-05 | Preflight and baseline | Repository root, `.git`, complete governing documents and three activated skills with references, complete domain tree, clean status, log and branch verification; frozen install, format, lint, typecheck, unit test, and production build | Local Windows | Passed at required HEAD `2a9a9d4`; 9 files and 204 tests passed | Repository root | Codex | Baseline build regenerated `next-env.d.ts`; the generated route-reference line was restored before the tracker update. |
| 2026-08-03 | TASK-05 | Authority audit | Compared every strict TASK-03 root/save field with `SYSTEMS_DESIGN.md`, `CONTENT_ARCHITECTURE.md`, and canonical entities from `STORY_BIBLE.md` | Local repository | Blocked before domain implementation | `docs/SYSTEMS_DESIGN.md`, `src/domain/schemas/**` | Codex | Required starting values, collection contents, revision, and supported save/schema literals are absent; schema test fixtures were explicitly rejected as authority. |
| 2026-08-03 | TASK-05 | Final repository verification | Frozen install, format, lint, typecheck, 204-test unit suite, production build, 7-project E2E suite, diff check, changed-path and boundary scans | Local Windows | Passed; no implementation was present to validate | `docs/PROGRESS.md` only | Codex | Repository health is green, but the authority blocker prevents TASK-05 acceptance. No implementation test was added or claimed. |
| 2026-08-03 | TASK-05 | Specification completion | Added authoritative missing-field, collection, metadata, relationship, and schema-representation decisions; reconciled tracker state without source implementation | Local repository | Ready for documentation review | `docs/SYSTEMS_DESIGN.md`, `docs/PROGRESS.md` | Codex | Existing explicit baseline values remain unchanged; TASK-05 returned to `not_started`; verified count remains 4 / 20. |
| 2026-08-03 | TASK-05 | Initialization implementation and local integration gate | Strict baseline/background/new-game implementation; frozen install, format, lint, typecheck, 240-test suite, production build, 7-project E2E, content-ID/field review, determinism, scope, secret, generated-output, and Git-integrity checks | Local Windows | Ready for review; all required commands passed | `src/domain/initialization/**`, `src/domain/index.ts`, `docs/PROGRESS.md` | Codex | 36 new tests; no persistence, migration, UI, production content, staging, commit, or push. |

An unexecuted command must not be entered as passed evidence.

## 5. Decision Log

| Decision ID | Date | Task | Decision | Reason | Alternatives considered | Affected documents or code | Owner | Follow-up |
|---|---|---|---|---|---|---|---|---|
| DEC-005 | 2026-08-03 | TASK-05 | Stop before implementation | A complete strict initial save requires values that the user-designated sole authority does not define | Guess zero/empty/50 values; reuse TASK-03 schema fixtures; derive later formulas; expose a partial initializer | `docs/PROGRESS.md` only | Codex | Add authoritative baseline values and supported version literals, then restart TASK-05 from a clean tree |
| DEC-006 | 2026-08-03 | TASK-05 | Adopt specification-owner initial-state completion decisions | The decisions fill every previously omitted required field without replacing explicit baseline values | Leave blocker open; modify schemas; encode assumptions only in implementation | `docs/SYSTEMS_DESIGN.md`, `docs/PROGRESS.md` | Specification owner | Review and commit documentation separately before requesting TASK-05 implementation |

Use this log for deliberate deviations from the roadmap or authoritative documents.

## 6. Blocker Log

| Blocker ID | Task | Severity | Description | Evidence | Owner | Required resolution | Status |
|---|---|---|---|---|---|---|---|
| BLK-005 | TASK-05 | Blocking | The provisional baseline could not satisfy the strict TASK-03 root/save schemas without inventing multiple required values and collections; starting revision and supported save/schema literals were also unspecified | Prior authority audit against `SYSTEMS_DESIGN.md` section 31 and TASK-03 schemas | Specification owner | Completed in `MVP Initial State Completion Decisions` | Resolved |

A blocker remains in the history even if work moves to another task.

## 7. Accepted Warning Log

| Warning ID | Task or release | Description | Impact | Mitigation | Acceptance owner | Follow-up task | Status |
|---|---|---|---|---|---|---|---|

Warnings cannot be accepted implicitly.

## 8. Release Status

| Release gate | Status |
|---|---|
| Repository integrity | Not evaluated |
| Build and static verification | Not evaluated |
| Unit tests | Not evaluated |
| Integration tests | Not evaluated |
| End-to-end tests | Not evaluated |
| Game-system invariants | Not evaluated |
| Content validation | Not evaluated |
| Narrative and continuity | Not evaluated |
| UI and accessibility | Not evaluated |
| Character art | Not evaluated |
| Security and RLS | Not evaluated |
| Database migrations | Not evaluated |
| Environment and secrets | Not evaluated |
| Performance | Not evaluated |
| Browser verification | Not evaluated |
| Preview deployment | Not evaluated |
| Rollback | Not evaluated |
| Post-deployment verification | Not evaluated |

- Final release decision: Incomplete evaluation
- Reason: Release evaluation remains outside this documentation-only history reconciliation; no deployment or production gate was requested.

## 9. Progress Update Rules

- Update after each meaningful task session.
- Record real commands and real results.
- Never overwrite failed evidence with a later success.
- Preserve blocker history.
- Link task status to inspected evidence.
- Record an implementation commit only after it exists.
- Never mark a task `verified` before required review.
- Never claim a URL that was not successfully opened.
- Never mark deployment complete without explicit authorization.
- Derive totals only from the task table.
- Keep this file concise enough to remain usable.

## 10. Document Status

- Status: Active progress tracker
- Implementation status: TASK-01 through TASK-05 verified; TASK-06 ready for review
- Current task: TASK-06
- Foundation baseline commit: `6979c02`
- Implementation tasks verified: 5 / 20
- Preview deployment: None
- Production deployment: None
- Release decision: TASK-06 ready for review; no release or publication authorized
