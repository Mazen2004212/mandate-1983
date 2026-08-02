# MANDATE: 1983 — First Playable MVP Scope

This document defines the first playable MVP: a polished vertical slice, not the complete game. The long-term vision remains an English-only, browser-based political narrative strategy game spanning a fictional Cold War era through government, family, diplomacy, intelligence, elections, coups, border conflict, and strategic war decisions. The MVP deliberately implements only the connected route and production-ready foundations described below. Everything identified as deferred or a non-goal remains outside first-playable scope.

## 1. Product Objective

The MVP must prove that MANDATE: 1983 can deliver a cohesive, replayable political-thriller experience in an original fictional 1980s setting. It must support:

- Player-customized first-family names.
- A complete political decision loop.
- Immediate and delayed consequences.
- Character and faction memory.
- Persistent, secure saves.
- Data-driven authored scenarios.
- Deterministic game-system behavior.
- Responsive browser gameplay.
- Accessible keyboard operation.
- Content validation.
- One small but complete playable route.

Depth, correctness, integration, and replayability take priority over content volume. Content counts in this document are boundaries for a coherent vertical slice, not targets that justify filler.

## 2. MVP Player Journey

The supported journey is:

1. Visit the landing page.
2. Register or sign in.
3. Create a new game.
4. Name the president and first family.
5. Select from the limited portrait presets.
6. Select a political background.
7. Receive the opening briefing.
8. Enter the office dashboard.
9. Participate in dialogue and decision scenes.
10. Conduct a cabinet meeting.
11. Review the economy and budget.
12. Review and sign a law or decree.
13. Receive an intelligence briefing.
14. See the media reaction.
15. Experience a delayed consequence.
16. Resolve the Chapter 1 crisis climax.
17. Reach an MVP route outcome and epilogue.
18. Save and resume the game.
19. Sign out, return, and continue the owned save.

Every step must form one real, connected flow using persistent state and authored content. Disconnected demonstration screens do not satisfy this scope.

## 3. Content Scope

The first playable content is limited to:

- The Prologue and Chapter 1.
- Approximately 12–16 substantial scenarios.
- Up to 4 optional or conditional scenarios.
- 6–8 major non-player characters.
- The customizable president.
- A customizable spouse, adult daughter, adult son, and adult sibling.
- 3 major political factions.
- 4 representative regions.
- 4–6 laws, decrees, budget measures, or government projects.
- 1 primary domestic crisis.
- 1 limited diplomatic conflict.
- 1 intelligence threat.
- 1 major family conflict.
- 1 cabinet-level conflict.
- 1 election-related pressure thread, without a complete national election.
- 3 MVP route outcomes demonstrating deterministic ending and epilogue resolution.
- 1 primary newspaper or media outlet capable of multiple ideological framings.

These ranges are scope boundaries, not quotas. Every included scenario must serve the route, meet Narrative Author standards, and pass Content Validator requirements. No scenario may be added merely to reach a count.

## 4. Included Game Systems

Implement only the first production-ready version of the following:

- Root game state and separation of immutable definitions from mutable save state.
- Timeline and political-period progression.
- National variables.
- Factions.
- Multi-dimensional relationships.
- Character memories.
- Flags and event history.
- Event eligibility.
- Immediate, delayed, and cumulative effects.
- Seeded deterministic variation.
- Exact treasury arithmetic using integer minor units or fixed precision.
- Basic revenue and expenditure.
- Basic inflation, unemployment, and public confidence.
- Government legitimacy and cabinet unity.
- Regional approval and unrest.
- Army, police, and intelligence loyalty indicators.
- Basic foreign relations.
- Family trust and public reputation.
- Save revisions and idempotent choice resolution.
- Save and load behavior.
- Content and save versioning.
- Three MVP route outcomes.
- Developer-only explanations for eligibility and consequences.

The architecture may expose clear extension points, but implementation must remain limited to behavior required by the MVP route. Unimplemented future systems must not be represented as working features.

## 5. Explicitly Deferred Systems

The following are deferred until after the first playable MVP:

- The full ten-chapter campaign and complete 1983–1991 timeline.
- Full parliamentary simulation.
- A complete national election engine.
- A complete coup simulation.
- A full strategic-war campaign or multiple active war fronts.
- Naval warfare.
- Detailed industrial and agricultural sectors.
- A complete diplomatic treaty network.
- Full intelligence-agency management.
- A large-scale construction system.
- An achievement catalog.
- Dozens of endings and a full character epilogue catalog.
- Advanced modding.
- Multiplayer.
- Native desktop and mobile-native applications.
- Localization beyond English.
- A complete admin content studio.
- Large-scale analytics.
- A full production art and music library.

The architecture may anticipate these systems where doing so avoids a known dead end, but the MVP must not implement speculative breadth or pretend deferred systems exist.

## 6. Required Player-Facing Pages

The MVP must provide these capabilities, whether through distinct routes or thoughtfully consolidated interfaces:

- Landing.
- Authentication.
- New Game.
- Family Customization.
- Political Background.
- Office Dashboard.
- Dialogue Scene.
- Cabinet.
- Economy and Budget.
- Law or Decree Signing.
- Intelligence Briefing.
- Newspaper or Media.
- Save Management.
- MVP Outcome and Epilogue.
- Account and Sign-out.

Each page or consolidated flow must use real connected data and implement every relevant loading, empty, populated, error, unauthorized, disabled, pending, and success state. Every capability must support responsive desktop, tablet, and mobile layouts; keyboard navigation; visible focus; accessible names and errors; long content; and long customized names. No fake action, disconnected mockup, placeholder screen, or deferred system may be presented as complete.

## 7. First-Family Customization

Players must be able to provide validated first and last names for the president, spouse, adult daughter, adult son, and adult sibling. Production narrative must use only the approved tokens:

```text
{{president.firstName}}  {{president.lastName}}  {{president.publicName}}
{{spouse.firstName}}     {{spouse.lastName}}
{{daughter.firstName}}   {{daughter.lastName}}
{{son.firstName}}        {{son.lastName}}
{{sibling.firstName}}    {{sibling.lastName}}
{{family.surname}}
```

Validation and rendering must support long names, apostrophes, hyphens, spaces, and Unicode. Possessives, greetings, and substitutions must remain natural and grammatical. Names and portrait choices must persist across save and load. No canonical customized-family name may be hard-coded into production content.

The portrait-preset subset is:

- 3 president presets.
- 2 spouse presets.
- 2 adult-daughter presets.
- 2 adult-son presets.
- 2 adult-sibling presets.

This is an MVP subset of the long-term art target. Presets must have meaningfully different identities and may not be simple recolors of one face.

## 8. Art and Audio Scope

MVP art includes:

- A complete UI design system with the established premium 1980s political-thriller direction.
- Political-document textures.
- Original fictional flags and basic emblems.
- The limited first-family portrait presets.
- Portraits for 6–8 major characters.
- One neutral portrait for every major character.
- One additional contextual expression for the most important characters.
- Responsive, UI-tested portrait crops.
- Asset metadata and explicit asset status.
- No real-person likenesses.

Deferred art includes six expressions for every character, a large supporting cast, complete costume variants, aging variants for every epilogue, a complete contact-sheet production library, and cinematic illustrations for every event. Placeholder or unreviewed art must never be reported as final.

Original music is not required for the first MVP. The route must remain fully usable and emotionally coherent without music. Unlicensed temporary music must not be presented as production audio. Accessible audio controls must be planned and implemented before audio is introduced.

## 9. Authentication, Saves, and Security

Secure saves are part of the vertical-slice proof and may not be postponed. The MVP requires:

- One complete supported registration and sign-in flow.
- Authenticated save ownership and owner-only save access.
- Explicit cross-user denial for read and mutation operations.
- Save revision control.
- Idempotent decision submission.
- Atomic state mutation and event-history recording.
- Minimal browser data exposure.
- Hidden state retained behind trusted server and database boundaries.
- Row Level Security for application-facing player-owned data.
- No service-role or other privileged secret in browser code.
- Safe errors and logs that do not disclose secrets or hidden game state.
- Negative authorization and ownership tests.
- Defined save deletion behavior.
- Account sign-out.
- Explicit rejection and recovery behavior for stale revisions.

Authentication establishes identity; authorization, server-side validation, ownership enforcement, and RLS must independently protect every save operation.

## 10. Technical Proof Goals

The MVP must demonstrate with executed evidence that:

- The selected application stack can build and deploy.
- Domain logic remains separate from React presentation.
- Scenario content is data-driven and stored outside generic UI components.
- Content schemas validate.
- Save mutations are deterministic, typed, validated, atomic, and idempotent.
- State changes and seeds are auditable.
- Old save versions can be identified and handled explicitly.
- First-family tokens validate and render correctly.
- Hidden state is not unnecessarily exposed to the browser.
- RLS blocks cross-user access.
- The complete player journey survives page refresh.
- A saved game can be closed, reopened, and resumed.
- Responsive layouts work at every project viewport.
- Keyboard-only operation is possible.
- The production build and required test suites pass.
- A real preview deployment can be reviewed before any production approval.

These are goals for later implementation and verification; this scope document does not claim that any application, system, test, or deployment currently exists.

## 11. Quality Bar

The MVP may not ship with:

- A knowingly broken critical path.
- Filler scenarios added merely to reach a count.
- Hard-coded customized-family names.
- Unresolved blocking content-validation errors.
- Fake data presented as completed persistence.
- A placeholder screen reported as a finished system.
- Placeholder art reported as final.
- A skipped required test reported as passed.
- A production-readiness claim without inspected evidence.
- Direct `Math.random()` calls in domain logic.
- Floating-point treasury arithmetic.
- Cross-user save access.
- A major choice without meaningful immediate and delayed consequences.
- An obviously perfect political choice.
- Content copied from *Suzerain* or any other game.

The critical route must be coherent, responsive, keyboard-operable, secure, deterministic where required, and honest about every incomplete element.

## 12. MVP Acceptance Criteria

The MVP is complete only when all applicable checks below have been executed, inspected, and recorded:

1. A new user can register or sign in through the supported flow.
2. The authenticated user can create a new game.
3. First-family names and selected portraits persist after save, reload, sign-out, and return.
4. The player can complete the connected Prologue and Chapter 1 route.
5. At least one optional scenario is reached through state-based eligibility.
6. At least one delayed consequence created in an earlier period resolves in a later period.
7. At least one character references a memory that was actually created by a prior decision.
8. At least one faction changes behavior based on prior decisions or faction memory.
9. At least one regional condition changes and is preserved in the save.
10. At least one media response changes according to a player decision.
11. Automated tests confirm exact treasury arithmetic across the MVP route.
12. Automated tests confirm equal state and seed produce equal outcomes.
13. Repeating a resolved choice request does not duplicate effects, memories, history, or revision advancement.
14. A mutation carrying a stale expected revision cannot overwrite newer progress.
15. Negative authorization tests confirm another authenticated user cannot read, modify, or delete the save.
16. The game can be saved, closed, reopened, and resumed at the correct state.
17. Each of the three MVP route outcomes is reachable through a distinct tested state combination.
18. Full content validation reports zero blocking errors.
19. Required unit, integration, security, accessibility, and end-to-end tests pass with nonzero discovered tests.
20. Every required page or consolidated capability is visually reviewed at applicable project viewports.
21. Keyboard-only operation, visible focus, accessible names, error communication, and automated accessibility checks pass.
22. No critical browser-console error, failed required request, hydration error, or critical network error remains.
23. A real preview deployment is successfully exercised through the critical player journey.
24. Release Gate produces an evidence-based final decision using specialist results, with no required gate left unevaluated.

## 13. Non-Goals

The first playable MVP is not:

- The complete campaign.
- A promise of all long-term content counts.
- A complete war game.
- A complete election simulator.
- A complete coup simulator.
- A complete art library.
- A complete soundtrack.
- A multiplayer game.
- A native desktop build.
- A mobile-native build.
- A content-authoring platform.
- A final production launch.

## 14. Post-MVP Expansion Principle

Expansion may begin only after:

- MVP acceptance criteria pass.
- Architecture weaknesses are documented.
- Player feedback is reviewed.
- Balance simulations are reviewed.
- Save compatibility is understood.
- Content-authoring throughput is measured.
- Art-production throughput is measured.
- Security and deployment risks are reviewed.

The next chapter must not begin merely because Chapter 1 content files exist. Expansion decisions must be based on evidence from the completed vertical slice, not on speculative content volume.

## 15. Document Status

- Status: Foundation baseline
- Scope owner: Project owner
- Implementation status: Not started
- Last reviewed commit: `e35a960`
- This document is authoritative for MVP scope until deliberately revised.
- The long-term master specification does not override these MVP limits during first-playable implementation.
