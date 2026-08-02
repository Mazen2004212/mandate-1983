# MANDATE: 1983 — First Playable MVP Implementation Roadmap

## 1. Roadmap Authority

`MVP_SCOPE.md` controls included features, `STORY_BIBLE.md` controls canon, `SYSTEMS_DESIGN.md` controls behavior and formulas, and `CONTENT_ARCHITECTURE.md` controls authored-content contracts. This roadmap controls implementation order and task boundaries. `PROGRESS.md` records actual status and inspected evidence.

A later task is not complete because a placeholder route, interface, schema, or mock exists. Dependencies may be deliberately revised only with a documented decision. Completing a task does not approve a release.

- Status: Foundation baseline
- Implementation status: Not started
- Last reviewed commit: `d695484`
- Target: First playable MVP
- Supported difficulty: Standard

## 2. Task Status Model

- `not_started`: No implementation work accepted.
- `in_progress`: Work began, but acceptance is not fully verified.
- `blocked`: A documented blocker prevents safe progress.
- `ready_for_review`: Implementation is believed complete; verification or owner review remains.
- `verified`: Acceptance criteria and required evidence were inspected.
- `deferred`: Deliberately outside the MVP or moved later with a documented reason.

Task status does not replace Release Gate status. Skipped required evidence, a commit alone, or a successful build alone cannot make a task `verified`.

## 3. Rules for Every Implementation Task

Every task records its ID, title, objective, scope, non-goals, dependencies, primary and companion skills, expected areas, acceptance criteria, tests, manual checks, evidence, security, accessibility, content/canon impact, checkpoint, commit, and rollback or recovery note.

Each session records initial and final Git status, preserves unrelated work, executes relevant tests, and records exact commands and results. Player-facing work requires browser evidence; authorization work requires negative tests; deterministic work requires fixed-seed evidence. Deployment always requires explicit authorization.

## 4. Implementation Task Sequence

### TASK-01 — Repository and Application Bootstrap

- **Objective:** Initialize the real application foundation.
- **Scope:** Current stable compatible Next.js App Router and React; strict TypeScript; pnpm; Tailwind; ESLint; Prettier; Vitest; React Testing Library; Playwright; axe-core; compatible Storybook; environment validation; source organization; initial CI; production build command.
- **Explicit non-goals:** Supabase connection, game content, production pages, or claims of completed gameplay.
- **Dependencies:** None; begins after this foundation pack is committed.
- **Primary owning skill:** Page Builder.
- **Required companion skills:** UI Director, Game Systems, Supabase Security, Release Gate.
- **Expected files or areas:** Package and lock manifests, Next.js configuration, source/test directories, environment example, CI workflow, root application entry points.
- **Acceptance criteria:** Clean install; type check, lint, unit-test, build, and initial Playwright commands execute; CI is inspected; stable versions are verified at execution time; no secrets; post-commit worktree clean.
- **Required tests:** Unit runner smoke test and Playwright smoke discovery with nonzero intended coverage or an accurately reported bootstrap limitation.
- **Required manual verification:** Inspect generated configuration, scripts, dependency versions, client/server boundaries, and initial rendered shell if runnable.
- **Required evidence:** Exact commands, versions, exit codes, CI path, build result, browser result, and Git status.
- **Security considerations:** Environment classification, no secret committed, no privileged browser variable.
- **Accessibility considerations:** Establish axe and keyboard-test foundations without claiming page compliance.
- **Content or canon considerations:** No content or canon authored.
- **Completion checkpoint:** Foundation installs reproducibly and all accepted bootstrap checks are inspected.
- **Suggested commit message:** `chore: initialize Mandate application foundation`
- **Rollback or recovery note:** Revert the isolated bootstrap commit; preserve foundation documents.

### TASK-02 — Design Tokens and Application Shell

- **Objective:** Implement the approved visual foundation and global shell.
- **Scope:** Color, typography, spacing, borders, shadows, focus, motion, breakpoints, background, navigation, state primitives, icon strategy, and document/panel surfaces.
- **Explicit non-goals:** Final game pages, final art, or disconnected mock dashboards.
- **Dependencies:** TASK-01 verified.
- **Primary owning skill:** UI Director.
- **Required companion skills:** Page Builder.
- **Expected files or areas:** Global styles, design tokens, shell components, primitive stories/tests, layout.
- **Acceptance criteria:** Period-authentic visual direction; keyboard focus; contrast and responsive review; loading/empty/error/unauthorized primitives; no generic SaaS, glassmorphism, or emoji icons.
- **Required tests:** Component behavior, axe checks, responsive/visual smoke tests where available.
- **Required manual verification:** Inspect Storybook or rendered shell at project viewports, 200% zoom, keyboard focus, and reduced motion.
- **Required evidence:** Screenshot paths, viewport list, accessibility output, console status, and inspected component states.
- **Security considerations:** Unauthorized presentation exposes no sensitive detail.
- **Accessibility considerations:** Visible focus, semantic landmarks, contrast, reduced motion, touch targets.
- **Content or canon considerations:** Materials follow the established 1980s political-thriller identity.
- **Completion checkpoint:** Reusable shell and primitives pass rendered review.
- **Suggested commit message:** `feat: establish Mandate design system and application shell`
- **Rollback or recovery note:** Revert shell commit without altering domain or persistence layers.

### TASK-03 — Domain Types and Runtime State Schemas

- **Objective:** Translate authoritative state and numeric contracts into tested TypeScript and Zod schemas.
- **Scope:** `MoneyMinor`, `BasisPoints`, `NormalizedScore`, `SignedWeight`, `Revision`, `PoliticalPeriod`, root state modules, save metadata, family identity, background IDs, visibility, and versions.
- **Explicit non-goals:** Simulation formulas, React UI, database schema, or authored scenarios.
- **Dependencies:** TASK-01 verified.
- **Primary owning skill:** Game Systems.
- **Required companion skills:** Supabase Security, Content Validator.
- **Expected files or areas:** Domain types, runtime schemas, fixtures, schema tests.
- **Acceptance criteria:** Strict compile; valid/invalid and boundary tests; no React imports; integer money; no undocumented fields.
- **Required tests:** Schema acceptance/rejection, numeric boundaries, version and visibility enums, family identity validation.
- **Required manual verification:** Compare every field and unit to `SYSTEMS_DESIGN.md` and security visibility rules.
- **Required evidence:** Type-check/test commands, field inventory, failures inspected, and dependency-boundary check.
- **Security considerations:** Hidden/admin fields classified and safe projections anticipated.
- **Accessibility considerations:** None directly; human-readable error structures must support later accessible forms.
- **Content or canon considerations:** Family roles and background IDs match authoritative documents.
- **Completion checkpoint:** Schemas exactly cover documented MVP state with no competing fields.
- **Suggested commit message:** `feat: define typed MVP game-state schemas`
- **Rollback or recovery note:** Revert schema commit before any persisted save depends on it.

### TASK-04 — Deterministic Arithmetic and Seed Primitives

- **Objective:** Implement canonical integer helpers and deterministic seed APIs.
- **Scope:** `clamp`, `clamp100`, half-away-from-zero `roundNearest`, `weightedAverage`, `approach`, derived seed contexts, bounded integers, and explanation data.
- **Explicit non-goals:** Full simulation formulas, content scheduling, or UI.
- **Dependencies:** TASK-03 verified.
- **Primary owning skill:** Game Systems.
- **Required companion skills:** None required beyond Release Gate at integration review.
- **Expected files or areas:** Pure domain math/random modules and unit/property tests.
- **Acceptance criteria:** Positive/negative rounding, ranges, repeatability, namespace separation, same-input equality, and no direct `Math.random()`.
- **Required tests:** Boundary, half-value, negative, invalid denominator/weight, fixed-seed, namespace, and bounded-output tests.
- **Required manual verification:** Inspect purity, seed inputs, integer-only operations, and debug projections.
- **Required evidence:** Fixed-seed fixtures, exact commands, discovered counts, and source search for prohibited randomness.
- **Security considerations:** Seed contexts exclude secrets and untrusted authoritative outcomes.
- **Accessibility considerations:** Not applicable to the pure domain increment.
- **Content or canon considerations:** No narrative content; namespaces remain stable for authored IDs.
- **Completion checkpoint:** Pure primitives are deterministic and independently tested.
- **Suggested commit message:** `feat: implement deterministic arithmetic and seed primitives`
- **Rollback or recovery note:** Revert before downstream formula implementation; never change published seed behavior without versioning.

### TASK-05 — Initial State and Political Backgrounds

- **Objective:** Create the provisional MVP baseline and apply each background once.
- **Scope:** Starting values, four background IDs/modifiers, clamping, version metadata, and seeded new-game factory.
- **Explicit non-goals:** Content prose, save persistence, or balance approval.
- **Dependencies:** TASK-04 verified.
- **Primary owning skill:** Game Systems.
- **Required companion skills:** Content Validator.
- **Expected files or areas:** Initial-state factory, background definitions, fixtures, tests.
- **Acceptance criteria:** Exact baseline; all backgrounds tested; apply-once protection; no universally superior background; fixed seed; minor-unit money.
- **Required tests:** Full baseline snapshot, modifier boundaries, duplicate application, stable IDs, deterministic initialization.
- **Required manual verification:** Compare every baseline and modifier to `SYSTEMS_DESIGN.md` and review trade-offs.
- **Required evidence:** Fixture diffs, fixed-seed outputs, commands, and balance status labeled as unmeasured.
- **Security considerations:** Hidden fields remain server-authoritative in future projections.
- **Accessibility considerations:** Not applicable to domain behavior.
- **Content or canon considerations:** Background labels do not determine ideology; canonical regions/factions preserved.
- **Completion checkpoint:** Each background produces one valid, versioned initial state.
- **Suggested commit message:** `feat: implement MVP initial state and backgrounds`
- **Rollback or recovery note:** Revert before saves are published; later changes require save/version review.

### TASK-06 — Content Schemas, Registries, and Manifest

- **Objective:** Implement runtime content contracts and registries.
- **Scope:** Metadata, lifecycle, IDs, scenarios, choices, conditions, effects, memories, flags, delayed effects, media, outcomes, manifest, and registries.
- **Explicit non-goals:** Production Chapter 1 content, UI, or database publication.
- **Dependencies:** TASK-03 verified.
- **Primary owning skill:** Content Validator.
- **Required companion skills:** Narrative Author, Game Systems, Supabase Security.
- **Expected files or areas:** Content schemas, registry loader, manifest model, validation tests, non-production fixtures.
- **Acceptance criteria:** Duplicate, missing-reference, unknown-field, version, and status validation; no executable arbitrary content.
- **Required tests:** Valid/invalid object fixtures, global ID uniqueness, registry resolution, manifest compatibility, lifecycle restrictions.
- **Required manual verification:** Cross-check all contracts against `CONTENT_ARCHITECTURE.md` and system fields.
- **Required evidence:** Validation command/output, precise error paths, registry coverage, and zero-production-content confirmation.
- **Security considerations:** Publication metadata and hidden fields do not grant client authority.
- **Accessibility considerations:** Schemas preserve accessible text/label requirements for future rendering.
- **Content or canon considerations:** Canon references and approved family tokens validate.
- **Completion checkpoint:** Typed registries reject every tested blocking defect.
- **Suggested commit message:** `feat: implement validated content contracts and registries`
- **Rollback or recovery note:** Revert before manifests publish; schema changes require explicit version migration thereafter.

### TASK-07 — Eligibility, Content Graphs, and Scenario Scheduler

- **Objective:** Implement deterministic conditions, graph validation, and event selection.
- **Scope:** Operators, explanations, predecessors/follow-ups, mandatory chains, cycle/reachability foundations, priority, waiting, seeded jitter, stable-ID ties.
- **Explicit non-goals:** Production scenarios, mutation application, or dynamic narrative generation.
- **Dependencies:** TASK-05 and TASK-06 verified.
- **Primary owning skill:** Game Systems.
- **Required companion skills:** Content Validator, Narrative Author.
- **Expected files or areas:** Eligibility evaluator, graph analyzer, scheduler, debug explanations, tests.
- **Acceptance criteria:** Eligible/blocked, contradictions, unavailable characters, expiration, cycles, stable ordering, and explanations work.
- **Required tests:** Operator table, graph failures, mandatory-cycle rejection, reachability fixtures, fixed-seed tie cases.
- **Required manual verification:** Inspect explanation accuracy and verify jitter never creates eligibility.
- **Required evidence:** Fixed-seed order traces, graph reports, exact commands, and tested error paths.
- **Security considerations:** Hidden conditions are not exposed through player-facing explanations.
- **Accessibility considerations:** Future disabled reasons must be safe and understandable without revealing hidden state.
- **Content or canon considerations:** Participant availability and knowledge constraints follow the Story Bible.
- **Completion checkpoint:** Same state/content/seed produces the same explainable schedule.
- **Suggested commit message:** `feat: implement deterministic scenario eligibility and scheduling`
- **Rollback or recovery note:** Revert scheduler independently; retain schema/registry foundation.

### TASK-08 — Authoritative Mutation and Delayed-Effect Engine

- **Objective:** Implement safe choice resolution and period advancement.
- **Scope:** Mutation contract, revision, idempotency, preconditions, effects, memories, flags, delays, media scheduling, history, atomic result, period loop, and failures.
- **Explicit non-goals:** Database persistence, player UI, or production content.
- **Dependencies:** TASK-05 and TASK-07 verified.
- **Primary owning skill:** Game Systems.
- **Required companion skills:** Supabase Security, Content Validator.
- **Expected files or areas:** Pure mutation engine, effect handlers, delayed queue, period resolver, event log, tests.
- **Acceptance criteria:** One revision increment; stale/conflicting requests rejected; retries return established results; failures apply nothing; delayed effects execute once in stable order.
- **Required tests:** Idempotency, atomic failure, stale revision, duplicate choice, delayed states/order, fixed-seed conditional effects.
- **Required manual verification:** Inspect state-before/after and event-history explanations against the 22-step contract.
- **Required evidence:** Mutation traces, fixed-seed results, exact commands, and invariant output.
- **Security considerations:** Browser intent only; hidden/calculated client inputs rejected; authorization preconditions represented.
- **Accessibility considerations:** Error codes support later accessible recovery messaging.
- **Content or canon considerations:** Effects use registered IDs and cannot invent narrative or fields.
- **Completion checkpoint:** Pure engine is atomic, idempotent, deterministic, and auditable.
- **Suggested commit message:** `feat: implement authoritative game-state mutation engine`
- **Rollback or recovery note:** Revert before persistence integration; mutation-version changes later require save compatibility review.

### TASK-09 — Economic, Government, Faction, Region, and Outcome Calculations

- **Objective:** Implement the documented MVP formulas exactly.
- **Scope:** Treasury/arrears, economy, confidence, legitimacy, approval, cabinet, factions, relationships, memories, regions, security, diplomacy, family, and three outcomes.
- **Explicit non-goals:** Full election, coup, war, or balance certification.
- **Dependencies:** TASK-05 verified; TASK-04 primitives verified.
- **Primary owning skill:** Game Systems.
- **Required companion skills:** Content Validator, Narrative Author.
- **Expected files or areas:** Pure calculation modules, outcome resolver, fixtures, invariant/simulation tests.
- **Acceptance criteria:** Exact integers, boundaries, reachable outcome fixtures, deterministic simulations, contributing-value explanations, and deferred systems absent.
- **Required tests:** Every formula, rounding boundary, range, memory decay, regional independence, outcome priority/fallback, fixed-seed simulations.
- **Required manual verification:** Formula-by-formula comparison with `SYSTEMS_DESIGN.md`; label balance as not yet measured.
- **Required evidence:** Test matrix, deterministic snapshots, outcome fixtures, commands, and explanation samples.
- **Security considerations:** Hidden risk indicators never enter ordinary projections.
- **Accessibility considerations:** Later qualitative bands require non-color-only descriptions.
- **Content or canon considerations:** Canonical factions, regions, relations, and outcome IDs preserved.
- **Completion checkpoint:** All MVP calculations are independently tested and explainable.
- **Suggested commit message:** `feat: implement MVP simulation formulas and outcomes`
- **Rollback or recovery note:** Revert formula commit or version behavior deliberately before compatible saves depend on it.

### TASK-10 — Supabase Foundation, Authentication, and RLS

- **Objective:** Initialize secure Supabase infrastructure.
- **Scope:** Local project where supported, authentication, profiles, save ownership/metadata/state, mutation history, RLS, constraints, environments, migrations.
- **Explicit non-goals:** Full player journey, production deployment, service-role browser access, or content publication.
- **Dependencies:** TASK-03 verified.
- **Primary owning skill:** Supabase Security.
- **Required companion skills:** Game Systems, Content Validator, Release Gate.
- **Expected files or areas:** Supabase configuration, migrations, RLS policies, database tests, environment example, server clients.
- **Acceptance criteria:** Owner CRUD; anonymous and cross-user denial; insert/update/delete ownership enforcement; no browser secrets; migration review and rollback notes.
- **Required tests:** Positive owner paths plus negative anonymous, cross-user, ownership-transfer, forged-ID, and direct-database paths.
- **Required manual verification:** Inspect every operation's policy, new-row validation, grants, clients, secrets, and migration order.
- **Required evidence:** Local database commands, RLS matrix, migration output, secret scan, and rollback procedure.
- **Security considerations:** This task is security-critical; authentication never substitutes for authorization.
- **Accessibility considerations:** Auth errors must later support safe, perceivable messages.
- **Content or canon considerations:** Database does not become an alternate source of authored canon.
- **Completion checkpoint:** Negative tests prove non-owners cannot access player saves.
- **Suggested commit message:** `feat: establish secure Supabase auth and save storage`
- **Rollback or recovery note:** Migration-specific rollback/restore plan; never rewrite an applied production migration.

### TASK-11 — Save Repository and Server Mutation Boundary

- **Objective:** Connect the domain engine to secure persistence.
- **Scope:** Create, load, list, delete, and resume saves; server-only mutation; revision conflicts; persisted idempotency; safe projections; compatibility errors.
- **Explicit non-goals:** Player-facing page delivery, content authoring, or deployment.
- **Dependencies:** TASK-08 and TASK-10 verified.
- **Primary owning skill:** Supabase Security.
- **Required companion skills:** Game Systems.
- **Expected files or areas:** Server repository/actions, transaction/RPC boundary, projection schemas, persistence integration tests.
- **Acceptance criteria:** Save/load equality; refresh/resume; stale and duplicate protection; cross-user denial; hidden-state projection; atomic evidence; safe errors.
- **Required tests:** Repository integration, concurrent revisions, idempotent replay/conflict, rollback on failure, ownership and hidden-field tests.
- **Required manual verification:** Inspect browser/server clients, transaction boundary, logs, error projection, and version recovery.
- **Required evidence:** Database/test commands, transaction trace, denial matrix, safe response samples, and Git status.
- **Security considerations:** Authenticate, authorize, validate, transact, and project minimally; privileged clients stay server-only.
- **Accessibility considerations:** Conflict and recovery messages must be understandable and focus-manageable later.
- **Content or canon considerations:** Save retains content/schema versions and registered history.
- **Completion checkpoint:** Persistence preserves exact authoritative mutation semantics under retry and conflict.
- **Suggested commit message:** `feat: connect authoritative saves to secure persistence`
- **Rollback or recovery note:** Revert application boundary and apply the reviewed database rollback/forward-fix plan without data loss.

### TASK-12 — Authentication and New-Game Player Journey

- **Objective:** Build the first connected player-facing flow.
- **Scope:** Landing, registration/sign-in, new game, family names, portrait presets, background, confirmation, first save.
- **Explicit non-goals:** Office dashboard, scenario play, or final full art library.
- **Dependencies:** TASK-02, TASK-05, and TASK-11 verified.
- **Primary owning skill:** Page Builder.
- **Required companion skills:** UI Director, Supabase Security, Game Systems, Character Art Director.
- **Expected files or areas:** Routes, forms, server actions, family/background components, portrait references, E2E tests.
- **Acceptance criteria:** Complex names persist safely; keyboard/responsive/state coverage; no canonical family names; real Supabase data.
- **Required tests:** Validation, auth, first-save integration, duplicate submit, E2E success/error/unauthorized/mobile/keyboard flows.
- **Required manual verification:** Render every state at project viewports, inspect focus, long names, portrait crops, console, and network.
- **Required evidence:** Screenshots, axe output, E2E commands, database record checks, and no-secret verification.
- **Security considerations:** Server authorization, CSRF-appropriate actions, minimal data, no service-role client exposure.
- **Accessibility considerations:** Labels, errors, focus movement, keyboard operation, contrast, touch targets.
- **Content or canon considerations:** Approved role tokens and four background IDs; portraits remain fictional and status-tracked.
- **Completion checkpoint:** A new authenticated user creates one valid persistent save through the real browser.
- **Suggested commit message:** `feat: build authentication and new-game journey`
- **Rollback or recovery note:** Revert journey without deleting compatible saves; preserve account access and migration state.

### TASK-13 — Office Dashboard and Save Management

- **Objective:** Build the authenticated presidential office and save-management experience.
- **Scope:** Office dashboard, period, briefing queue, qualitative summaries, save list/resume/delete/sign-out, incompatibility state.
- **Explicit non-goals:** Dialogue resolution, government workspaces, or exposing exact hidden scores.
- **Dependencies:** TASK-02 and TASK-11 verified.
- **Primary owning skill:** Page Builder.
- **Required companion skills:** UI Director, Game Systems, Supabase Security.
- **Expected files or areas:** Office/save routes, projections, components, actions, component/E2E/accessibility tests.
- **Acceptance criteria:** Real saves; no leaks or fake statistics; responsive/keyboard operation; loading, empty, error, stale, and incompatible states.
- **Required tests:** Owner list/resume/delete, cross-user denial, projection, stale UI, empty/error, E2E keyboard/mobile.
- **Required manual verification:** Screenshot all states and inspect console, failed requests, long names, focus, and deletion confirmation.
- **Required evidence:** Screenshot paths, test commands, RLS denial result, browser/viewport details, and network review.
- **Security considerations:** Owner-only reads/deletes, safe confirmation, server-side hidden-state projection.
- **Accessibility considerations:** Landmarks, headings, table/list semantics, focus restoration, live error messages.
- **Content or canon considerations:** Office presentation follows canon and uses qualitative bands honestly.
- **Completion checkpoint:** Owner can safely locate, resume, and delete saves in the real app.
- **Suggested commit message:** `feat: build office dashboard and save management`
- **Rollback or recovery note:** Revert UI/actions while retaining saves; never delete data as rollback.

### TASK-14 — Dialogue and Decision Experience

- **Objective:** Build the reusable scenario, beat, dialogue, and choice interface.
- **Scope:** Speakers/portraits, variants, availability, disabled reasons, confirmation, feedback, delay signals, memories, keyboard operation.
- **Explicit non-goals:** Authoring all production scenarios or bypassing the mutation engine.
- **Dependencies:** TASK-02, TASK-07, TASK-08, and TASK-11 verified.
- **Primary owning skill:** Page Builder.
- **Required companion skills:** UI Director, Narrative Author, Game Systems, Content Validator, Character Art Director.
- **Expected files or areas:** Dialogue route/components, content renderer, server mutation action, tests/stories/E2E.
- **Acceptance criteria:** Validated data; authoritative mutations; duplicate protection; refresh safety; long names; mobile/desktop; accessible order/focus.
- **Required tests:** Variant/eligibility components, mutation integration, duplicate click, refresh resolved state, keyboard/mobile/axe E2E.
- **Required manual verification:** Inspect all interaction states, portraits, long prose, disabled explanations, confirmations, console, and network.
- **Required evidence:** Screenshots, content IDs, test commands, mutation trace, accessibility report, and viewports.
- **Security considerations:** Client cannot submit effects or hidden state; responses expose only safe consequences.
- **Accessibility considerations:** Logical reading order, focus after resolution, labeled choices, no color-only state, reduced motion.
- **Content or canon considerations:** Voices, knowledge, memory variants, and family tokens validate.
- **Completion checkpoint:** One representative validated scenario resolves safely end-to-end.
- **Suggested commit message:** `feat: build validated dialogue and decision experience`
- **Rollback or recovery note:** Revert renderer/action while preserving resolved-save history and registered content.

### TASK-15 — Government Workspaces

- **Objective:** Build the connected MVP government interfaces.
- **Scope:** Cabinet, economy/budget, law/decree signing, intelligence briefing, newspaper/media; shared workspace architecture where useful.
- **Explicit non-goals:** Deferred full simulations, fake buttons, or placeholder systems labeled complete.
- **Dependencies:** TASK-02, TASK-09, and TASK-11 verified.
- **Primary owning skill:** Page Builder.
- **Required companion skills:** UI Director, Game Systems, Narrative Author, Content Validator, Supabase Security.
- **Expected files or areas:** Government routes/components/projections/actions and browser/accessibility tests.
- **Acceptance criteria:** Real state, exact money display, qualitative hidden-state handling, intelligence confidence, fact/frame distinction, full states, responsive/accessibility review.
- **Required tests:** Projection/unit tests, action integration, unauthorized/error/loading/empty states, keyboard/mobile/axe E2E.
- **Required manual verification:** Inspect each workspace at required viewports and verify documents, focus, console, network, and confirmation behavior.
- **Required evidence:** Screenshots per workspace/state, commands, accessibility results, and real data trace.
- **Security considerations:** Protected actions authorized server-side; intelligence and hidden values minimally projected.
- **Accessibility considerations:** Readable tables/documents, semantic headings, focus, alternative status cues, zoom.
- **Content or canon considerations:** Institutional authority, media facts, and intelligence classifications follow canon/contracts.
- **Completion checkpoint:** Every listed workspace capability functions against real state without pretending deferred systems exist.
- **Suggested commit message:** `feat: build connected government workspaces`
- **Rollback or recovery note:** Revert workspace commit; preserve domain and save compatibility.

### TASK-16 — Prologue Production Content

- **Objective:** Author, validate, integrate, and play through the MVP Prologue.
- **Scope:** Opening, inauguration pressure, family introduction, cabinet tension, first choices, Chapter 1 transition.
- **Explicit non-goals:** Chapter 1 content, final outcomes, or filler scenes.
- **Dependencies:** TASK-06, TASK-07, TASK-08, TASK-12, and TASK-14 verified.
- **Primary owning skill:** Narrative Author.
- **Required companion skills:** Content Validator, Game Systems, Page Builder, UI Director, Character Art Director.
- **Expected files or areas:** Versioned Prologue content, registries/manifest, fixtures, integration/E2E tests, approved asset references.
- **Acceptance criteria:** Stable IDs/references; voices/tokens/trade-offs; effects/memories; delayed setup; zero blocking errors; connected playthrough.
- **Required tests:** Schema/reference/graph/continuity/token/effect validation and Prologue E2E route.
- **Required manual verification:** Narrative, originality, Teen rating, character voice, real UI readability, portrait integration, route playthrough.
- **Required evidence:** Validation report, scenario inventory/status, screenshots, playthrough trace, commands, and reviewed warnings.
- **Security considerations:** Content cannot expose hidden state or define direct database behavior.
- **Accessibility considerations:** Dialogue length, reading order, focus, names, and portrait alternatives reviewed.
- **Content or canon considerations:** Full Story Bible continuity and original expression required.
- **Completion checkpoint:** Published-manifest Prologue completes in the real app with zero blocking validation errors.
- **Suggested commit message:** `feat: add validated Prologue content`
- **Rollback or recovery note:** Withdraw manifest entries with explicit existing-save compatibility; never silently delete published IDs.

### TASK-17 — Chapter 1 Production Content

- **Objective:** Author and integrate the substantial Chapter 1 scenario set.
- **Scope:** Supply Emergency, Roven incident, Lantern File, cabinet/family conflicts, election pressure, optional content, media, measures, delays, climax foundations.
- **Explicit non-goals:** Post-MVP chapters, full elections/coups/war, or quota-driven filler.
- **Dependencies:** TASK-15 and TASK-16 verified.
- **Primary owning skill:** Narrative Author.
- **Required companion skills:** Content Validator, Game Systems, Page Builder, UI Director, Character Art Director.
- **Expected files or areas:** Chapter content, shared definitions, manifest/registries, validation fixtures, E2E routes.
- **Acceptance criteria:** Within MVP limits; reachable variation; optional scenario; remembered action; faction behavior; regional consequence; media framings; zero blocking errors.
- **Required tests:** Full content validation, graph/reachability, fixed-seed eligibility, continuity/token/effect checks, representative E2E routes.
- **Required manual verification:** Review every scenario for purpose, voice, uncertainty, trade-offs, rating, originality, and rendered readability.
- **Required evidence:** Inventory by lifecycle, graph report, route traces, screenshots, commands, warnings and owners.
- **Security considerations:** Hidden sources/knowledge protected; authored files cannot mutate persistence directly.
- **Accessibility considerations:** Long-form reading, choice focus, responsive documents, and non-color cues reviewed.
- **Content or canon considerations:** Preserve deliberate uncertainty and canonical institutions/characters.
- **Completion checkpoint:** Complete Chapter 1 graph validates and reaches its climax through real play.
- **Suggested commit message:** `feat: add validated Chapter 1 content`
- **Rollback or recovery note:** Use content-version withdrawal/rollback and preserve compatible published IDs/saves.

### TASK-18 — MVP Outcomes, Epilogues, and Art Integration

- **Objective:** Complete three route outcomes and the limited MVP art set.
- **Scope:** Civic Stabilization, Ordered Emergency, Fractured Mandate, presentation, epilogues, family presets, 6–8 NPC portraits, expressions, metadata, crops, fallbacks.
- **Explicit non-goals:** Dozens of endings, full art catalog, aging variants, or one-choice endings.
- **Dependencies:** TASK-09, TASK-15, and TASK-17 verified.
- **Primary owning skill:** Narrative Author.
- **Required companion skills:** Game Systems, Content Validator, Character Art Director, UI Director, Page Builder.
- **Expected files or areas:** Outcome/epilogue content, outcome UI, asset metadata/references, tests and screenshot artifacts.
- **Acceptance criteria:** Three reachable multi-state outcomes; continuity/tokens valid; no placeholder final art or real likenesses; references valid; responsive/accessibility review.
- **Required tests:** Outcome reachability/priority, epilogue eligibility/continuity, asset-reference validation, E2E outcome routes, axe/visual tests.
- **Required manual verification:** Art rights/originality, contact sheets, UI crops, epilogue prose, viewports, keyboard, contrast, console.
- **Required evidence:** Fixed-state outcome fixtures, validation report, approved asset statuses, screenshots, rights review, commands.
- **Security considerations:** Outcome resolver rejects invalid saves and exposes only safe contributing information.
- **Accessibility considerations:** Portrait alt handling, readable epilogues, focus, zoom, and responsive crop checks.
- **Content or canon considerations:** Epilogues honor memories, availability, regions, institutions, and family tokens.
- **Completion checkpoint:** All three outcomes complete through real browser routes with approved integrated art.
- **Suggested commit message:** `feat: complete MVP outcomes and production art integration`
- **Rollback or recovery note:** Roll back content/assets through versioned manifest while preserving save-compatible outcome IDs.

### TASK-19 — Integrated Verification and Preview Release

- **Objective:** Verify the complete MVP in a reviewable preview environment.
- **Scope:** Unit/integration/content/RLS/E2E/accessibility/visual/browser/network/performance/fixed-seed checks and authorized preview deployment.
- **Explicit non-goals:** Production approval or deployment without separate authorization.
- **Dependencies:** TASK-18 and all preceding required tasks verified.
- **Primary owning skill:** Release Gate.
- **Required companion skills:** Every scope-relevant specialist.
- **Expected files or areas:** Test/evidence reports, approved CI/config adjustments, preview configuration, release report.
- **Acceptance criteria:** Complete new-user route; resume; three outcomes; cross-user denial; duplicate/stale handling; viewports; clean critical console/network; real URL only after successful authorized deployment.
- **Required tests:** All authoritative suites with nonzero discovered required tests, negative security cases, fixed-seed routes, accessibility and browser smoke.
- **Required manual verification:** Inspect preview journeys, screenshots, browsers, performance, logs, monitoring, and rollback readiness.
- **Required evidence:** Gate matrix, exact commands/counts/results, URLs opened, screenshots, environment/commit, warnings/blockers.
- **Security considerations:** Preview isolation, safe credentials, RLS denial, secret scan, no production mutation.
- **Accessibility considerations:** Automated and manual review across critical journeys and viewports.
- **Content or canon considerations:** Zero blocking content errors and reviewed originality/rating/continuity evidence.
- **Completion checkpoint:** Release Gate issues an evidence-based preview decision; deployment occurs only if authorized.
- **Suggested commit message:** `test: verify complete first playable MVP`
- **Rollback or recovery note:** Remove/rollback preview artifact and preserve known-good commit/data; document trigger and owner.

### TASK-20 — Balance Review and MVP Release Candidate

- **Objective:** Review play/simulation evidence and prepare an MVP release candidate.
- **Scope:** Fixed-seed routes, playtesting, dominant choices, outcomes, backgrounds, oscillation, delays, throughput, limitations, release notes, rollback, production decision.
- **Explicit non-goals:** Claiming balance from formulas, expanding post-MVP scope, or unauthorized production deployment.
- **Dependencies:** TASK-19 verified.
- **Primary owning skill:** Release Gate.
- **Required companion skills:** All eight skills as required by evidence scope.
- **Expected files or areas:** Balance/release evidence, release notes, rollback plan, approved targeted corrections only.
- **Acceptance criteria:** Evidence classifications; documented blockers/warnings/owners; no formula-only balance claim; explicit authorization before production; final Release Gate decision.
- **Required tests:** Fixed-seed matrix, route/outcome/background comparisons, regression suites, security/content/UI release gates.
- **Required manual verification:** Structured playtests, specialist reviews, risk/rollback review, final artifact/environment inspection.
- **Required evidence:** Simulation/playtest reports, gate matrix, accepted-warning log, rollback plan, release identity, final decision.
- **Security considerations:** Production secrets, migrations, RLS, backups, monitoring, and authorization receive strict review.
- **Accessibility considerations:** Critical accessibility blockers prevent release; accepted warnings require an owner.
- **Content or canon considerations:** Release content remains within MVP, original, Teen-appropriate, reachable, and version-compatible.
- **Completion checkpoint:** A documented Release Gate decision exists; production is separately authorized.
- **Suggested commit message:** `chore: prepare first playable MVP release candidate`
- **Rollback or recovery note:** Define application, content, database, asset, and secret recovery independently before approval.

## 5. Dependency Graph

```text
01
└── 02
    ├── 12
    ├── 13
    ├── 14
    └── 15

01
└── 03
    ├── 04
    │   └── 05
    │       ├── 07
    │       ├── 08
    │       └── 09
    ├── 06
    │   └── 07
    │       └── 08
    └── 10
        └── 11
            ├── 12
            ├── 13
            ├── 14
            └── 15

12 + 14
└── 16
    └── 17
        └── 18
            └── 19
                └── 20
```

The per-task dependency lists are authoritative where they add necessary integration prerequisites to this primary chain. Work may overlap only after shared dependencies are verified. Do not parallelize work that would create competing schemas, temporary contracts, or duplicated architecture.

## 6. Implementation Phases

- Phase A — Application Foundation: TASK-01–02
- Phase B — Domain Foundation: TASK-03–09
- Phase C — Secure Persistence: TASK-10–11
- Phase D — Player Experience: TASK-12–15
- Phase E — Production Content: TASK-16–18
- Phase F — Verification and Release Candidate: TASK-19–20

Phases are planning groups, not permission to execute a whole phase as one Codex task.

## 7. MVP Completion Rule

The MVP is incomplete until all non-deferred TASK-01–20 are `verified`, every `MVP_SCOPE.md` acceptance criterion is satisfied, required tests are executed and inspected, preview evidence and specialist reviews exist, Release Gate issues an evidence-based decision, no blocker is hidden behind a future task, and production deployment is separately authorized.

## 8. Deferred Post-MVP Roadmap

Deferred work includes additional chapters, expanded elections, coup progression, strategic war, more regions and factions, a larger art library, audio/music, more endings and epilogues, an admin content studio, advanced difficulties, localization, desktop packaging, and modding. These do not belong in the current twenty-task MVP roadmap.

## 9. Roadmap Status

- Status: Foundation baseline
- Implementation status: Not started
- Current task: TASK-01
- Last reviewed commit: `d695484`
- Total MVP implementation tasks: 20
- Verified implementation tasks: 0
- This roadmap does not claim any application feature exists.
- Changes require deliberate review and version control.
