# MANDATE: 1983 State Model

## Contents

- [Principles](#principles)
- [Root Game State](#root-game-state)
- [Metadata](#metadata)
- [Timeline](#timeline)
- [National Variables](#national-variables)
- [Visibility Levels](#visibility-levels)
- [Factions](#factions)
- [Relationships](#relationships)
- [Memories](#memories)
- [Regions](#regions)
- [Pending Events and Delayed Effects](#pending-events-and-delayed-effects)
- [Elections](#elections)
- [Coup State](#coup-state)
- [War State](#war-state)
- [Ending State](#ending-state)
- [Versioning and Migration](#versioning-and-migration)

## Principles

- Keep authored definitions immutable and runtime saves versioned.
- Use strict types and validate every untrusted boundary.
- Separate player-visible, report-dependent, hidden, and debug-only state.
- Store money exactly in integer minor units or fixed precision.
- Make seeded outcomes deterministic and transitions auditable.

Every numeric field must declare its unit, valid range, visibility, and overflow or rejection behavior in the implementation. Suggested ranges below are defaults, not permission to erase meaningful domain distinctions.

## Root Game State

Define the conceptual root contract with these modules:

```text
metadata, identity, timeline, national, factions, characters, relationships,
memories, regions, cabinet, parliament, constitution, economy, projects,
diplomacy, military, wars, elections, intelligence, media, family, flags,
eventHistory, pendingEvents, delayedEffects, achievements, endingState,
debugMetadata
```

Treat this as a domain contract, not permission to create one enormous, unmaintainable object. Give each module an explicit owner and stable boundary.

## Metadata

Store save ID, user ID, save version, content version, revision, seed, creation and update timestamps, difficulty, game mode, and completed flag. Use server-owned user identity and revision fields. Treat timestamps as persistence metadata, not simulation time.

## Timeline

Store chapter, political year, month, week, period number, crisis mode, war turn, and election cycle. Advance them only through validated game-time transitions.

## National Variables

Suggested normalized ratings use `0..100`; percentages use an explicitly documented bounded percentage type; money and production totals use exact domain units and documented game-specific bounds. Visibility is a default and may become more restrictive, never less restrictive, when revealing it would expose hidden simulation state.

### Economy

| Variables | Suggested range or unit | Default visibility |
| --- | --- | --- |
| Treasury, revenue, expenditure, debt, debt interest, reserves, export income | Exact minor currency units; domain-bounded signed totals | Player-visible |
| Inflation, unemployment, growth | Documented bounded rates; allow signed growth | Player-visible |
| Currency stability, food supply, fuel supply | `0..100` ratings | Player-visible |
| Industrial, agricultural, energy output | Non-negative indexed or exact production units | Report-dependent |
| Import dependency, poverty, inequality | `0..100` ratings | Report-dependent |
| Corruption | `0..100` rating | Qualitative-only |
| Investor confidence, consumer confidence, infrastructure | `0..100` ratings | Report-dependent |

### Government

| Variables | Suggested range | Default visibility |
| --- | --- | --- |
| Presidential authority, legitimacy, parliamentary support, cabinet unity | `0..100` | Player-visible |
| Civil-service efficiency, judicial independence, election integrity, press freedom | `0..100` | Report-dependent |
| Emergency powers, state-media control, provincial autonomy | `0..100` or explicit legal state where categorical | Player-visible |
| Government corruption | `0..100` | Qualitative-only |

### Society

| Variables | Suggested range | Default visibility |
| --- | --- | --- |
| Approval, living standards, public morale | `0..100` | Player-visible |
| Polarization, protest intensity, strike intensity, crime | `0..100` | Report-dependent |
| Education, healthcare, legal equality, minority rights, religious freedom | `0..100` | Player-visible |
| Regional inequality, refugee pressure | `0..100` plus exact counts where needed | Report-dependent |
| Youth, rural, urban support | `0..100` | Report-dependent |

### Security

| Variables | Suggested range | Default visibility |
| --- | --- | --- |
| Army, police, intelligence, and Presidential Guard loyalty | `0..100` | Qualitative-only |
| Army, navy, and air-force readiness | `0..100` | Report-dependent |
| Coup risk indicators, assassination risk, insurgency risk, terror threat | `0..100` components, never one decisive score | Hidden |
| Border security | `0..100` | Report-dependent |
| Foreign infiltration, smuggling, civil-conflict risk | `0..100` | Hidden |

### International

| Variables | Suggested range or unit | Default visibility |
| --- | --- | --- |
| Major-bloc and neighbor relations | `-100..100` per actor | Player-visible |
| International reputation, sanctions risk, trade access, diplomatic leverage, treaty credibility | `0..100` | Report-dependent |
| Foreign aid | Exact minor currency or resource units | Player-visible |

### Family

| Variables | Suggested range | Default visibility |
| --- | --- | --- |
| Spouse, daughter, son, and sibling trust | `-100..100` | Qualitative-only |
| Family unity, public reputation, spouse popularity | `0..100` | Qualitative-only |
| Scandal risk, succession pressure | `0..100` | Hidden |

## Visibility Levels

- **Public:** Safe for in-world public records and player display.
- **Player-visible:** Safe for direct interface display but not necessarily public in-world.
- **Qualitative-only:** Reveal authored bands or descriptions, not raw values.
- **Report-dependent:** Reveal only through valid reports, advisers, or intelligence.
- **Hidden:** Keep server-side unless a deliberate game effect reveals it.
- **Developer-debug-only:** Expose only in protected development tools and logs.

Serialize browser payloads from explicit public projections. Never send hidden data merely because the UI does not render it.

## Factions

Define each faction state with:

```text
id, support, trust, fear, organization, mobilization, radicalization, unity,
governmentAccess, demands, redLines, memories, regionalInfluence
```

Use stable IDs. Suggested ratings are `0..100`; define regional influence per region. Keep authored demands and red lines in immutable definitions while storing their runtime satisfaction and memory state in saves.

## Relationships

Model trust, respect, fear, relevant affection, ideological alignment, personal leverage, public relationship, and private relationship separately. Use `-100..100` for directional dimensions and explicit identifiers for participants. Derive summaries for presentation; never replace the dimensions with one score.

## Memories

Store stable ID, subject, target, source event, emotional weight, political weight, public/private visibility, creation period, decay behavior, permanence, and dialogue, event, and ending influence.

- Keep permanent memories until an explicit migration or authored resolution changes them.
- Decay temporary memories deterministically by game period.
- Record consumed or superseded status rather than deleting audit history.
- Prevent duplicate insertion with a stable memory key.

## Regions

Store stable ID, population, economy, approval, security, infrastructure, food, fuel, unemployment, protests, military presence, faction influence, governor, active projects, and active crises. Keep authored geography separate from runtime state. Reference active projects by stable ID and preserve regional effect history.

## Pending Events and Delayed Effects

Store a unique ID, source event, source choice, trigger period, prerequisites, cancellation conditions, typed payload, resolution status, and idempotency key. Record scheduled, cancelled, resolved, and failed states explicitly. A resolved or cancelled item must not execute.

## Elections

Store election type, candidates, parties, regional polling, turnout, integrity, fraud, campaign resources, media access, scandals, results, and certification status. Preserve inputs and derived-seed metadata needed to explain and replay results.

## Coup State

Use explicit stages: Dormant, Organizing, Capable, Imminent, Active, Failed, Successful, and Negotiated. Store intent, capability, preparation, discovery, participants, responses, and resolution independently. Never expose the internal stage or raw capability directly to the player.

## War State

Store conflict ID, participants, war aims, fronts, territorial control, supplies, readiness, morale, intelligence, abstract casualties, civilian displacement, international support, negotiation leverage, active orders, turn history, and outcome. Keep orders high-level and fictional. Preserve each turn's inputs, derived seed, effects, and explanation.

## Ending State

Store eligible ending IDs, locked ending IDs with reasons, selected ending, selection explanation, and epilogue state. Prevent duplicate unlocks and select among eligible endings deterministically through declared priority and exclusion rules.

## Versioning and Migration

- Store both save-schema version and content version.
- Provide explicit forward migrations and migration tests.
- Test old and current saves, including failed migrations.
- Back up before destructive migration.
- Provide failure recovery and never allow silent data loss.
- Preserve revision and idempotency history across migration.
