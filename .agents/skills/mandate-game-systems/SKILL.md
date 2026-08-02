---
name: mandate-game-systems
description: "Use when designing, implementing, revising, debugging, testing, or balancing MANDATE: 1983 simulation systems, including game state, consequences, factions, relationships, economy, elections, coups, war, diplomacy, regions, delayed effects, event eligibility, save-safe mutations, or ending resolution. Do not use for visual-only UI work, narrative-writing-only tasks, static art production, or documentation-only changes unrelated to game behavior."
---

# Build MANDATE: 1983 Game Systems

Design simulation work as typed, deterministic, auditable domain behavior. Read [the state model](references/state-model.md), [the systems checklist](references/systems-checklist.md), and [the balancing and determinism guide](references/balancing-and-determinism.md) completely before editing.

## Understand the System

Before editing:

1. Read the repository-root `AGENTS.md`.
2. Read this skill and all three references.
3. Inspect existing domain types, state schemas, reducers, tests, save format, event definitions, and related systems.
4. Identify every producer and consumer of the changed data.
5. Classify visible and hidden state.
6. Identify persistence and migration implications.
7. Identify deterministic-seed requirements.
8. Identify multiplayer or concurrent-save implications, even though the game is single-player.
9. State a brief implementation plan.

## Separate Concerns

Keep immutable game definitions, runtime save state, domain calculations, state mutations, event eligibility, consequence scheduling, persistence, presentation, authored narrative content, and debugging tools separate.

- Never place simulation formulas in React components.
- Never let visual components mutate persistent state directly.
- Never make database queries part of pure domain calculations.

## Enforce Core Engineering Rules

- Use strict TypeScript, explicit domain types, and no `any`.
- Validate untrusted boundaries with Zod.
- Prefer pure functions and immutable state transitions.
- Produce deterministic behavior for a given seed.
- Represent money with integer minor units or fixed precision.
- Define valid numeric ranges and clamp only where the contract permits it.
- Make mutations idempotent and effect resolution auditable.
- Keep tests repeatable and saves aware of save and content versions.
- Provide migrations when versions change.
- Never call `Math.random()` directly in game-domain logic.
- Never depend on wall-clock time unless it is explicitly converted to game time.
- Reject duplicate choice resolution, achievement unlocks, and ending unlocks.
- Reject invalid state explicitly; never repair it silently.

Provide a dedicated seeded-random service for new-game, event-derived, war-turn, election, and coup seeds. Support replayable debugging and stable output when unrelated UI code changes.

## Define Every Mutation

For each mutation, define:

- Mutation ID and input schema.
- Preconditions and authorization requirements.
- Idempotency key.
- State before and state after.
- Immediate and delayed effects.
- Memories and flags added or removed.
- Event-log entry.
- Save-revision behavior.
- Error behavior and migration implications.

Never let a mutation apply twice, partially apply without recoverable transaction behavior, overwrite a newer revision, exceed valid ranges, depend on client-supplied hidden state, or trust raw browser input.

## Model Consequences

Support immediate, end-of-period, delayed, cumulative, threshold, character-memory, faction-memory, regional, media, economy, war, election, hidden, publicly misunderstood, propaganda-created, and seeded-scenario consequences.

Normally make every major decision affect at least one political or government variable, one faction or regional variable, one character or relationship variable, and one delayed or cumulative consequence. Avoid obviously perfect decisions.

## Model Required Systems

Use [the state model](references/state-model.md) as the detailed contract. At minimum, model:

- National economy, government, society, security, international relations, family, and hidden threats.
- Faction support, trust, fear, organization, mobilization, radicalization, unity, access, demands, red lines, and memories.
- Relationship trust, respect, fear, relevant affection, ideological alignment, leverage, public/private standing, and permanent/temporary memories. Never reduce every relationship to one score.
- Regional population, economy, approval, security, infrastructure, food, fuel, unemployment, protests, military presence, faction influence, governor, projects, and crises.
- Character-memory identity, subject, target, event, emotional and political weight, visibility, creation period, decay, permanence, and dialogue/event/ending influence.

## Resolve the Economy

Track separate revenue and expenditure, debt service, inflation, unemployment, growth, reserves, currency stability, food and fuel availability, production, corruption, confidence, projects, delayed returns, and regional effects.

Define each project with cost, funding source, start period, construction duration, corruption risk, regional disruption, completion state, maintenance cost, delayed benefit, and failure or cancellation states. Never grant full benefits immediately.

## Resolve Elections

Combine regional support, party organization, candidate approval, economy, war, scandals, media access, campaign spending, turnout, integrity, fraud, opposition unity, foreign interference, prior promises, and regional identity. Make outcomes deterministic for a given state and seed, explainable in debug mode, independent of any single popularity score, and covered at edge cases.

## Resolve Coups

Combine army and officer loyalty, Presidential Guard and intelligence loyalty, legitimacy, economic collapse, war outcomes, unrest, foreign interference, appointments, purges, emergency powers, family access, opposition coordination, and regional unrest.

Model preparation, capability, intent, discovery, execution, loyalist response, public reaction, foreign reaction, and final resolution separately. Never reduce the system to one percentage or provide real-world operational instructions.

## Resolve War

Keep war strategic, abstract, fictional, and teen-appropriate. Track manpower, readiness, officer loyalty, morale, equipment, ammunition, fuel, supply and medical capacity, air and naval readiness, air defense, intelligence, terrain, fortifications, civilian morale, war support, international support, sanctions, refugees, abstract casualties, territorial control, and negotiation leverage.

Resolve turns from orders, logistics, readiness, leadership, morale, intelligence, terrain, weather, air support, foreign support, equipment condition, corruption, previous investment, and bounded seeded variation. Never let raw chance decide a major outcome. Never implement real-time combat, manually controlled units, or real-world tactical instructions.

## Resolve Endings

Combine state variables, political route, constitution, elections, war and coup results, family outcomes, character memories, regional state, foreign alignment, economy, legitimacy, and major flags. Never make a major ending depend on one choice.

When several endings qualify, resolve them by explicit priority, specificity, mutually exclusive groups, and deterministic ties. Keep eligibility testable and explainable.

## Test Invariants

Require unit tests for clamping, exact money, effects, idempotency, delayed consequences, factions, relationships, memories, event eligibility, economy periods, projects, elections, coups, war turns, endings, save migration, seed stability, and duplicate prevention. Add property or invariant tests where useful.

Verify that:

- Treasury arithmetic remains exact and percentages remain valid.
- Resolved choices and completed delayed effects cannot execute again.
- Accepted mutations increase the save revision.
- Stale revisions cannot overwrite newer saves.
- Equal seeds and state produce equal results.
- Hidden information is not sent unnecessarily to the browser.
- Ending unlocks cannot duplicate.

## Explain Debug Results

Provide developer-only explanations for event eligibility and blocking, election results, coup progression, war-turn outcomes, ending eligibility, changed values, delayed effects, added memories, and used seeds. Never expose debug output to ordinary players.

## Report Delivery

Use [the systems checklist](references/systems-checklist.md). Report the changed system, domain model, files, state fields, persistence and migration impact, mutations, determinism, executed tests, checked invariants, debugging support, limitations, and skipped checks with reasons.

Never claim a test, invariant, simulation, or balance result passed unless it was executed and inspected.
