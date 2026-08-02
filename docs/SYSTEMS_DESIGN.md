# MANDATE: 1983 — MVP Systems Design

This document is the authoritative behavioral specification for MVP simulation logic until replaced by tested implementation.

## 1. Document Authority and Scope

`docs/MVP_SCOPE.md` controls which features belong in the first playable MVP. `docs/STORY_BIBLE.md` controls fictional canon. This document controls MVP state variables, units, formulas, resolution order, deterministic behavior, mutation semantics, and the initial balancing baseline.

Future TypeScript and Zod schemas must implement this specification rather than silently invent competing rules. Production narrative may select among valid effects but must not create undefined state fields. Supabase and persistence code must preserve the mutation and revision semantics defined here.

Numerical values are an initial balancing baseline, not immutable fictional canon. Balance changes require deliberate, version-controlled revision and tests. Full election, coup, and war simulation remain deferred beyond the MVP.

- Status: Foundation baseline
- Design authority: Authoritative for MVP behavior
- Implementation status: Not started
- Last reviewed commit: `b9ef050`
- Supported MVP difficulty: Standard
- Release language: English

## 2. System Design Goals

The MVP requires deterministic outcomes for equal state, content version, and seed; exact treasury arithmetic; auditable mutations; meaningful immediate and delayed consequences; bounded state changes; fair uncertainty; and no uncontrolled randomness. It must use multiple dimensions rather than one global popularity value and must not offer a universally perfect political choice.

Authored content, simulation calculations, persistence, and presentation remain separate. Resolution must be save-safe, retry-safe, and explainable in developer mode. Architecture may support later expansion but must not represent deferred systems as implemented. The MVP favors understandable depth over excessive variable count.

## 3. Canonical Numeric Types and Units

### MoneyMinor

- Conceptual type: Signed 64-bit integer
- Unit: One Varenne Crown cent
- Conversion: 100 minor units equal 1 Varenne Crown
- Floating-point money is prohibited.
- Display formatting must not alter the stored value.

### NormalizedScore

- Type: Integer
- Inclusive range: `0..100`
- Uses: Trust, legitimacy, loyalty, supply, confidence, approval, readiness, organization, radicalization, and similar variables

Interpretive bands are `0..19` Critical, `20..39` Weak, `40..59` Contested, `60..79` Strong, and `80..100` Exceptional. These descriptive labels never replace exact developer values.

### SignedWeight

- Type: Integer
- Inclusive range: `-100..100`
- Uses: Memory weight, sentiment, and directional influence

### BasisPoints

- Type: Integer
- Conversion: 100 basis points equal 1 percent
- Uses: Inflation, unemployment, growth, and rates

### Revision

A non-negative integer that increases by exactly one for every accepted authoritative save mutation.

### PoliticalPeriod

A non-negative integer. The Prologue is period `0`; Chapter 1 decision periods are `1..6`; MVP outcome resolution occurs after period `6`.

### SeedValue

A persisted deterministic seed that never depends on browser time, render count, request timing, or process ID.

## 4. Canonical Integer Helpers

```text
clamp(value, minimum, maximum)
```

Returns `value` constrained to the inclusive bounds.

```text
clamp100(value) = clamp(value, 0, 100)
```

```text
roundNearest(numerator, denominator)
```

The denominator must be positive. Results round to the nearest integer, with exact halves rounded away from zero. Future implementation must use one shared, tested function.

```text
weightedAverage(items)
  = roundNearest(
      sum(item.value × item.weight),
      sum(item.weight)
    )
```

Weights are positive integers, values use compatible units, and zero total weight is invalid.

```text
approach(current, target, maximumStep)
  = current + clamp(target - current, -maximumStep, maximumStep)
```

Use `approach` for gradual period-based variables instead of instant movement to targets. Every formula in this document uses exact integer arithmetic and explicit rounding.

## 5. State Visibility

State visibility categories are Public, Player-visible exact, Player-visible qualitative, Report-dependent, Hidden, Developer-only, and Administrative.

- Hidden and developer-only values remain server-authoritative.
- A hidden value must not be sent to the browser merely because the UI does not render it.
- Player-visible qualitative values may be projected as bands without exposing exact scores.
- Developer explanations never appear in ordinary player responses.
- Narrative must not reveal hidden numeric effects unless explicitly designed to do so.

## 6. MVP Root State Domains

The conceptual root state consists of modular domains:

- `metadata`
- `identity`
- `timeline`
- `national`
- `economy`
- `government`
- `security`
- `international`
- `factions`
- `characters`
- `relationships`
- `memories`
- `regions`
- `family`
- `cabinet`
- `lawsAndMeasures`
- `flags`
- `eventHistory`
- `pendingEvents`
- `delayedEffects`
- `media`
- `outcomeState`
- `debugMetadata`

These domains do not authorize one unmaintainable file or an enormous React-owned object.

## 7. MVP Timeline and Period Loop

Period `0` covers inauguration and the Prologue. Periods `1..6` cover Chapter 1. One normal political period represents approximately one month, although exact calendar dates may be authored later. Scenario chains may occur inside one period without advancing time. Only an explicit period-advance mutation advances the political period.

At period advance, execute atomically in this order:

1. Validate save ownership, revision, and pending transition.
2. Resolve due delayed effects.
3. Apply project or policy maintenance costs.
4. Resolve treasury and arrears.
5. Resolve economy targets and gradual changes.
6. Resolve regional approval and unrest.
7. Recalculate faction behavior.
8. Recalculate government and security indicators.
9. Update temporary-memory decay.
10. Determine newly eligible scenarios.
11. Generate required media reactions.
12. Append the period summary.
13. Increment the period.
14. Increment the save revision.
15. Commit atomically.

Any blocking resolution error prevents period advancement.

## 8. Deterministic Seeded Variation

A dedicated seeded-random service derives deterministic integer results from:

```text
gameSeed
namespace
entityId
politicalPeriod
attemptIndex
contentVersion
```

Representative contexts combine the game seed with a scenario ID, delayed-effect ID, media-reaction ID, border-crisis resolution ID and period, or MVP-outcome resolution ID.

Direct `Math.random()` is prohibited in domain logic. Results remain stable when unrelated UI code changes, and retrying the same accepted logical operation does not generate a new outcome. The exact hash algorithm is deferred to implementation, but the seed API must return deterministic integers.

- Ordinary bounded variation: `-2..+2`
- High-uncertainty authored resolution: `-4..+4`
- Variation never determines a major result alone.
- Variation normally represents less than 10 percent of the score range used for a decision.
- Developer explanations include the seed and derived context.

## 9. Effect Magnitude Budgets

Typical authored changes to normalized scores are:

- Minor: `±1..3`
- Moderate: `±4..7`
- Major: `±8..12`
- Exceptional crisis effect: `±13..18`

A single normalized-score effect greater than `12` requires explicit narrative and balancing justification. An effect greater than `18` is invalid for normal MVP authored content. Aggregate effects within one transaction require review. Delayed effects are not automatically safer than immediate effects. Money effects use explicit `MoneyMinor` amounts.

Out-of-range authored effects are validation errors and must not be silently clamped during authoring. Runtime recovery may clamp corrupted or migrated state only when it logs and reports the correction.

## 10. Mutation Contract

Every authoritative mutation defines:

- Mutation ID and type
- Actor and save ID
- Input schema
- Expected revision
- Idempotency key
- Source scenario and, where relevant, source choice
- Preconditions
- State fields read and changed
- Immediate and delayed effects
- Memories and flags
- Media triggers
- Event-history entry
- Resulting revision
- Safe response projection
- Failure behavior

The browser submits player intent, for example:

```text
Resolve choice scenario_supply_01 / choice_imports
```

It never submits authoritative calculated outcomes. Reject unknown mutation types, scenarios, or choices; ineligible choices; invalid payloads; unauthorized actors; saves owned by other users; stale revisions; conflicting reuse of an idempotency key; client-provided hidden state or calculated outcomes; and direct changes to immutable definitions.

## 11. Mutation Resolution Order

For normal choice resolution:

1. Authenticate the actor.
2. Authorize save ownership.
3. Validate input.
4. Compare the expected revision.
5. Check the idempotency key.
6. Load immutable content definitions.
7. Validate scenario and choice eligibility.
8. Capture the state-before summary.
9. Apply immediate base effects.
10. Apply valid conditional modifiers.
11. Apply bounded seeded variation where explicitly defined.
12. Validate resulting ranges and invariants.
13. Add or update memories.
14. Add and remove flags.
15. Schedule delayed effects.
16. Schedule media reactions.
17. Mark the choice resolved.
18. Append the event-history entry.
19. Recalculate affected derived indicators.
20. Increment revision exactly once.
21. Commit the complete transaction atomically.
22. Return the minimum safe response.

A pre-commit failure applies nothing. A retry with the same valid idempotency key returns the established result without applying effects again.

## 12. MVP Economic State

Authoritative exact-money fields are `treasuryMinor`, `monthlyRevenueMinor`, `monthlyExpenditureMinor`, `monthlyDebtServiceMinor`, `arrearsMinor`, `plannedArrearsPaymentMinor`, `periodFinancingInflowsMinor`, and `periodProjectOutflowsMinor`.

Basis-point variables are `inflationBps`, `unemploymentBps`, and `annualGrowthBps`. Normalized economic variables are `currencyStability`, `foodSupply`, `fuelSupply`, `industrialOutput`, `agriculturalOutput`, `infrastructure`, `corruption`, `investorConfidence`, and `consumerConfidence`.

```text
currentObligationsMinor
  = monthlyExpenditureMinor
  + monthlyDebtServiceMinor
  + periodProjectOutflowsMinor

cashAfterCurrentObligationsMinor
  = treasuryMinor
  + monthlyRevenueMinor
  + periodFinancingInflowsMinor
  - currentObligationsMinor
```

When `cashAfterCurrentObligationsMinor >= 0`:

```text
actualArrearsPaymentMinor
  = min(
      plannedArrearsPaymentMinor,
      arrearsMinor,
      cashAfterCurrentObligationsMinor
    )

nextTreasuryMinor
  = cashAfterCurrentObligationsMinor
  - actualArrearsPaymentMinor

nextArrearsMinor
  = arrearsMinor
  - actualArrearsPaymentMinor
```

When `cashAfterCurrentObligationsMinor < 0`:

```text
nextTreasuryMinor = 0

nextArrearsMinor
  = arrearsMinor
  + absolute(cashAfterCurrentObligationsMinor)
```

Borrowing is never automatic. Borrowing, aid, reserve sales, and emergency financing require explicit authored measures.

## 13. Economic Derived Scores

```text
deficitStress
  = clamp100(
      roundNearest(
        max(0, currentObligationsMinor - monthlyRevenueMinor) × 100,
        max(monthlyRevenueMinor, 1)
      )
    )

arrearsStress
  = clamp100(
      roundNearest(
        arrearsMinor × 50,
        max(monthlyRevenueMinor, 1)
      )
    )

supplyStability
  = weightedAverage(
      foodSupply: 55,
      fuelSupply: 45
    )

inflationStress
  = clamp100(
      roundNearest(
        max(0, inflationBps - 300),
        20
      )
    )

unemploymentStress
  = clamp100(
      roundNearest(
        max(0, unemploymentBps - 400),
        16
      )
    )

growthScore
  = clamp100(
      50 + roundNearest(annualGrowthBps, 10)
    )

fiscalSolvency
  = clamp100(
      100
      - roundNearest(deficitStress × 60, 100)
      - roundNearest(arrearsStress × 40, 100)
    )
```

Arrears around two months of revenue produce maximum arrears stress. Inflation at or below 3 percent produces no inflation stress; inflation near 23 percent reaches maximum stress. Unemployment at or below 4 percent produces no unemployment stress; unemployment near 20 percent reaches maximum stress. Annual growth of `-5%`, `0%`, and `+5%` maps approximately to growth scores `0`, `50`, and `100`.

## 14. Economic Period Formulas

`priceStabilityReliefBps` is an authored aggregate in `0..500` representing active, funded, valid short-term measures.

```text
inflationTargetBps
  = clamp(
      200
      + (100 - foodSupply) × 8
      + (100 - fuelSupply) × 6
      + deficitStress × 5
      + (100 - currencyStability) × 5
      + arrearsStress × 4
      - priceStabilityReliefBps,
      200,
      3000
    )

nextInflationBps
  = clamp(
      inflationBps
      + clamp(
          roundNearest(inflationTargetBps - inflationBps, 4),
          -250,
          300
        ),
      0,
      5000
    )

growthTargetBps
  = clamp(
      -300
      + industrialOutput × 4
      + agriculturalOutput × 2
      + infrastructure × 2
      + investorConfidence × 2
      + consumerConfidence
      - inflationStress × 2
      - (100 - fuelSupply) × 2
      - corruption,
      -800,
      800
    )

nextAnnualGrowthBps
  = clamp(
      annualGrowthBps
      + clamp(
          roundNearest(growthTargetBps - annualGrowthBps, 3),
          -150,
          150
        ),
      -1000,
      1000
    )
```

`employmentReliefBps` and `regionalEmploymentShockBps` each use `0..600`.

```text
unemploymentTargetBps
  = clamp(
      600
      + (100 - industrialOutput) × 8
      + (100 - growthScore) × 4
      + regionalEmploymentShockBps
      - employmentReliefBps,
      300,
      3000
    )

nextUnemploymentBps
  = clamp(
      unemploymentBps
      + clamp(
          roundNearest(unemploymentTargetBps - unemploymentBps, 4),
          -150,
          200
        ),
      0,
      4000
    )

collectionAdjustmentBps
  = clamp(
      roundNearest(annualGrowthBps, 12)
      + (civilServiceEfficiency - 50) × 2
      - max(0, corruption - 50) × 2,
      -250,
      250
    )

nextMonthlyRevenueMinor
  = roundNearest(
      monthlyRevenueMinor × (10000 + collectionAdjustmentBps),
      10000
    )
```

Monthly expenditure changes primarily through authored laws, measures, projects, debt service, and valid indexed obligations. The simulation does not fabricate new spending categories.

## 15. Confidence Formulas

```text
consumerConfidenceTarget
  = weightedAverage(
      growthScore: 20,
      100 - inflationStress: 25,
      100 - unemploymentStress: 20,
      supplyStability: 20,
      governmentLegitimacy: 15
    )

nextConsumerConfidence
  = approach(consumerConfidence, consumerConfidenceTarget, 6)

borderStability = 100 - borderEscalation

investorConfidenceTarget
  = weightedAverage(
      currencyStability: 25,
      100 - corruption: 20,
      governmentLegitimacy: 15,
      infrastructure: 15,
      growthScore: 20,
      borderStability: 5
    )

nextInvestorConfidence
  = approach(investorConfidence, investorConfidenceTarget, 5)
```

## 16. Government State and Formulas

Government tracks `publicApproval`, `governmentLegitimacy`, `assemblySupport`, `cabinetUnity`, `civilServiceEfficiency`, `constitutionalCompliance`, `pressFreedom`, `electionIntegrity`, `emergencyAuthority`, and `mediaClimate`, all as `NormalizedScore`.

```text
averageFactionTrust
  = roundNearest(
      civicRenewalTrust
      + nationalStewardshipTrust
      + workersCommonwealthTrust,
      3
    )
```

Authored penalties `activeScandalPenalty`, `repressionPenalty`, and `publicCabinetConflictPenalty` each use `0..20`.

```text
legitimacyTarget
  = clamp100(
      weightedAverage(
        publicApproval: 30,
        constitutionalCompliance: 20,
        cabinetUnity: 15,
        assemblySupport: 15,
        civilServiceEfficiency: 10,
        electionIntegrity: 10
      )
      - activeScandalPenalty
    )

nextGovernmentLegitimacy
  = approach(governmentLegitimacy, legitimacyTarget, 5)

averageRegionalApproval
  = roundNearest(sum(all four regional approval scores), 4)

publicApprovalTarget
  = clamp100(
      weightedAverage(
        consumerConfidence: 25,
        supplyStability: 20,
        averageRegionalApproval: 20,
        governmentLegitimacy: 20,
        mediaClimate: 10,
        familyPublicReputation: 5
      )
      - repressionPenalty
    )

nextPublicApproval
  = approach(publicApproval, publicApprovalTarget, 5)
```

`averageMinisterTrust` and `averageMinisterRespect` are the respective averages across currently serving MVP ministers.

```text
cabinetUnityTarget
  = clamp100(
      weightedAverage(
        averageMinisterTrust: 50,
        averageMinisterRespect: 25,
        assemblySupport: 15,
        civilServiceEfficiency: 10
      )
      - publicCabinetConflictPenalty
    )

nextCabinetUnity
  = approach(cabinetUnity, cabinetUnityTarget, 4)
```

## 17. Faction Model

Each MVP faction tracks support, trust, fear, organization, mobilization, radicalization, unity, government access, unmet-demand severity, repression memory, red-line violations, faction memories, and regional influence. Numeric fields use `0..100`; collections and flags do not.

```text
factionGrievance
  = weightedAverage(
      100 - trust: 35,
      unmetDemandSeverity: 30,
      100 - governmentAccess: 15,
      repressionMemory: 20
    )

factionMobilization
  = weightedAverage(
      organization: 35,
      radicalization: 25,
      factionGrievance: 25,
      unity: 15
    )

factionPressure
  = weightedAverage(
      support: 25,
      factionMobilization: 30,
      organization: 25,
      unity: 20
    )
```

Behavior bands:

- Cooperative: Trust at least `60`, radicalization at most `40`, and no active red-line violation.
- Bargaining: Trust `40..59` or moderate unmet demands.
- Obstructive: Trust below `40` or an active red-line violation.
- Mobilizing: Mobilization at least `65` and grievance at least `60`.

Support, trust, and organization remain separate; high public support can coexist with low trust in the president. Faction changes normally come from authored decisions, fulfilled or broken promises, appointments, repression, economic outcomes, regional conditions, and delayed memories, not ideology labels alone.

## 18. Relationship Model

Each major relationship tracks trust, respect, fear, affection where relevant, ideological alignment, personal leverage, public relationship, private relationship, temporary memories, and permanent memories.

```text
fearPenalty
  = max(0, roundNearest(fear - 60, 2))

leverageBonus
  = min(10, roundNearest(personalLeverage, 5))

willingnessToCooperate
  = clamp100(
      weightedAverage(
        trust: 35,
        respect: 25,
        ideologicalAlignment: 15,
        privateRelationship: 15,
        publicRelationship: 10
      )
      + leverageBonus
      - fearPenalty
    )

candor
  = weightedAverage(
      trust: 45,
      respect: 25,
      privateRelationship: 20,
      100 - fear: 10
    )
```

Fear may temporarily increase compliance but reduces candor. Leverage is not trust. Public and private relationships may diverge. Affection does not replace trust, respect, or political alignment. Major relationship eligibility never collapses to one value.

## 19. Character Memory Model

Every memory defines a memory ID, subject, target, source event, emotional weight, political weight, public/private visibility, creation period, decay rate per period, permanence, and dialogue, event, and outcome influence tags.

For non-permanent memories:

```text
remainingPercent
  = max(0, 100 - decayRatePerPeriod × ageInPeriods)

effectiveEmotionalWeight
  = roundNearest(emotionalWeight × remainingPercent, 100)

effectivePoliticalWeight
  = roundNearest(politicalWeight × remainingPercent, 100)
```

Permanent memories always use `remainingPercent = 100`.

```text
memoryPressure
  = clamp(
      roundNearest(sum(relevant effective political weights), 50),
      -20,
      20
    )
```

Memories primarily affect eligibility, dialogue variation, trust changes, faction behavior, and outcomes. Presence may matter independently of weight. A character cannot reference a memory absent from the save, and a completed memory-creation effect cannot run twice.

## 20. Regional Model

Each of the four MVP regions tracks approval, local economy, unemployment in basis points, food supply, fuel supply, infrastructure, security tension, protest intensity, military presence, dominant faction influences, active projects, active crises, and governor trust.

```text
regionalUnemploymentStress
  = clamp100(
      roundNearest(max(0, unemploymentBps - 400), 16)
    )

regionalEconomicStress
  = weightedAverage(
      regionalUnemploymentStress: 35,
      100 - foodSupply: 25,
      100 - fuelSupply: 15,
      100 - infrastructure: 10,
      100 - localEconomy: 15
    )

regionalUnrestTarget
  = weightedAverage(
      regionalEconomicStress: 40,
      100 - approval: 25,
      securityTension: 20,
      localFactionMobilization: 15
    )

nextProtestIntensity
  = approach(protestIntensity, regionalUnrestTarget, 8)

regionalApprovalTarget
  = weightedAverage(
      publicApproval: 30,
      localEconomy: 20,
      foodSupply: 15,
      fuelSupply: 10,
      infrastructure: 10,
      governorTrust: 5,
      100 - securityTension: 10
    )

nextRegionalApproval
  = approach(approval, regionalApprovalTarget, 6)

averageRegionalUnrest
  = roundNearest(sum(all four protest-intensity scores), 4)
```

National averages never overwrite regional state.

## 21. Security and Intelligence Indicators

Track `armyLoyalty`, `armyReadiness`, `armyAlertLevel`, `policeLoyalty`, `intelligenceLoyalty`, `presidentialGuardLoyalty`, `borderSecurity`, `foreignInfiltrationRisk`, `borderTension`, `publicRetaliationDemand`, and `intelligenceUncertainty`.

```text
securityInstability
  = weightedAverage(
      100 - governmentLegitimacy: 20,
      100 - armyLoyalty: 20,
      100 - policeLoyalty: 15,
      100 - intelligenceLoyalty: 15,
      averageRegionalUnrest: 20,
      foreignInfiltrationRisk: 10
    )
```

`securityInstability` is a hidden narrative-risk indicator, not a complete coup system.

```text
borderEscalation
  = weightedAverage(
      borderTension: 30,
      100 - dravicaRelations: 20,
      100 - borderSecurity: 15,
      armyAlertLevel: 15,
      intelligenceUncertainty: 10,
      publicRetaliationDemand: 10
    )
```

`borderEscalation` does not implement a complete war system. Its narrative bands are `0..39` Controlled, `40..59` Unstable, `60..74` Severe, and `75..100` Critical. Crossing a band never automatically causes war or a coup; it may enable authored warnings, scenarios, or delayed effects.

## 22. Intelligence Confidence

Every intelligence assertion tracks confidence score, source count, source independence, corroboration, known contradiction, possible manipulation, and intentional-fabrication assessment.

- `90..100`: Confirmed
- `75..89`: Highly credible
- `60..74`: Probable
- `40..59`: Unverified
- `25..39`: Disputed
- `10..24`: Likely fabricated
- `0..9`: Unsupported

`Deliberate disinformation` is not merely a low score. It requires:

```text
intentionalFabricationAssessment = true
```

Ordinary player-facing reports do not expose developer-only confidence calculations unless an in-world institution provides the assessment.

## 23. International and Diplomatic State

Track normalized relations with the Commonwealth of Caldris, Union of Dromir Republics, Dravica, Belvar Republic, and Republic of Cyrane. Also track `internationalReputation`, `tradeAccess`, `diplomaticLeverage`, `foreignAidDependence`, and `sanctionsRisk`.

```text
foreignLeverage
  = weightedAverage(
      internationalReputation: 25,
      tradeAccess: 20,
      diplomaticLeverage: 25,
      borderStability: 15,
      100 - foreignAidDependence: 10,
      100 - sanctionsRisk: 5
    )
```

Every authored foreign offer defines its immediate benefit, financial cost, political condition, diplomatic condition, faction reaction, delayed consequence, dependency risk, and expiry. No foreign aid is automatically free.

## 24. Family State

Track `spouseTrust`, `daughterTrust`, `sonTrust`, `siblingTrust`, `familyPublicReputation`, `spousePublicReputation`, `familyScandalRisk`, and family memories.

```text
familyUnity
  = weightedAverage(
      spouseTrust: 30,
      daughterTrust: 20,
      sonTrust: 20,
      siblingTrust: 15,
      familyPublicReputation: 15
    )
```

Customized names and portraits confer no direct mechanical bonus. Background and prior choices may alter initial relationships. Family members remain independent actors; family trust is not a single romance meter. Scandal risk is hidden or report-dependent, and outcomes depend on combinations of state and memory.

## 25. Political Background Options

### `civil_service_reformer`

- `civilServiceEfficiency +5`
- `constitutionalCompliance +3`
- Civic Renewal League trust `+5`
- National Stewardship Union trust `-2`

### `provincial_governor`

- Lydra approval `+4`
- Roven approval `+4`
- Governor trust in every region `+3`
- National Stewardship Union trust `+3`
- Orsanne approval `-2`

### `labor_mediator`

- Workers’ Commonwealth trust `+6`
- Kestrel approval `+4`
- `cabinetUnity +3`
- `investorConfidence -3`

### `security_committee_chair`

- `armyLoyalty +4`
- `policeLoyalty +3`
- `borderSecurity +5`
- National Stewardship Union trust `+4`
- Civic Renewal League trust `-3`

Apply background modifiers once during new-game creation and clamp affected values afterward. IDs are stable. Labels and descriptions are authored separately. No background is universally superior, determines ideology, or forces later choices.

## 26. Event Eligibility

Scenario eligibility may reference political period, chapter, required and excluded flags, required memories, relationship and faction ranges, regional ranges, laws and measures, security, economy, family, previous scenario outcomes, background, and content version.

All required conditions must be true and all exclusion conditions false. A scenario is ineligible if a required character is unavailable, its political window expired, its requirements conflict, it already resolved without repeatability, its content version is incompatible, or a mandatory predecessor did not occur.

## 27. Event Selection

Categories are Direct follow-up, Mandatory, Major, Optional, Ambient media, and Outcome. Select in this order:

1. Due direct follow-ups.
2. Due mandatory scenarios.
3. Highest-priority eligible major scenario.
4. At most one optional scenario per normal period.
5. Ambient media outputs.

```text
effectivePriority
  = basePriority × 100
  + urgency × 10
  + min(periodsWaiting, 9)
  + seededTieJitter

seededTieJitter = deterministic integer 0..9
```

Seeded jitter only resolves close ordering and never creates eligibility. Direct follow-ups outrank ordinary priority. Exact remaining ties resolve by stable scenario ID. Mandatory scenarios cannot form uncontrolled cycles. The scheduler records why each scenario was eligible or blocked.

## 28. Delayed Effects

Every delayed effect defines a unique effect ID, source scenario, source choice, creation period, trigger period, payload, prerequisites, cancellation conditions, idempotency key, priority, and status.

Statuses are Pending, Executed, Cancelled, Expired, and Failed. Resolve by earliest trigger period, then highest priority, then stable effect ID.

An executed effect cannot execute again; a cancelled effect cannot execute. Failed effects block period advancement until recovered or deliberately resolved. Cancellation is recorded rather than silently deleted. A triggered effect may create narrative eligibility but may not invent undefined content.

## 29. Media Reaction Model

Media reactions are authored, never dynamically generated through an unrestricted language model. Each reaction defines outlet, event facts, editorial frame, `SignedWeight` sentiment, reach, credibility, public or leaked knowledge requirements, and source scenario and choice.

```text
weightedMediaSentiment
  = roundNearest(
      sum(sentiment × reach × credibility),
      sum(reach × credibility)
    )
```

When at least one qualifying reaction exists:

```text
mediaClimateTarget
  = clamp100(50 + roundNearest(weightedMediaSentiment, 2))

nextMediaClimate
  = approach(mediaClimate, mediaClimateTarget, 8)
```

Propaganda may distort interpretation but cannot invent an event. Classified information requires a valid leak or disclosure. No outlet is omniscient, and media sentiment does not rewrite objective state.

## 30. MVP Outcome Resolution

Stable outcome IDs are `mvp_civic_stabilization`, `mvp_ordered_emergency`, and `mvp_fractured_mandate`.

```text
institutionalScore
  = weightedAverage(
      governmentLegitimacy: 20,
      constitutionalCompliance: 20,
      cabinetUnity: 15,
      assemblySupport: 15,
      civilServiceEfficiency: 10,
      electionIntegrity: 10,
      averageFactionTrust: 10
    )

orderScore
  = weightedAverage(
      100 - averageRegionalUnrest: 20,
      armyLoyalty: 15,
      policeLoyalty: 15,
      intelligenceLoyalty: 15,
      borderSecurity: 10,
      governmentLegitimacy: 15,
      cabinetUnity: 10
    )

resilienceScore
  = weightedAverage(
      supplyStability: 20,
      fiscalSolvency: 15,
      consumerConfidence: 10,
      investorConfidence: 10,
      averageRegionalApproval: 15,
      familyUnity: 10,
      foreignLeverage: 10,
      cabinetUnity: 10
    )
```

### `mvp_civic_stabilization`

Eligible when Chapter 1 is complete, `institutionalScore >= 60`, `constitutionalCompliance >= 55`, `averageRegionalUnrest <= 55`, at least two faction-trust scores are at least `45`, and `severe_constitutional_breach` is absent.

### `mvp_ordered_emergency`

Eligible when Chapter 1 is complete, Civic Stabilization was not selected, `orderScore >= 62`, `emergencyAuthority >= 50`, `borderEscalation <= 70`, `supplyStability >= 40`, and `security_command_breakdown` is absent.

### `mvp_fractured_mandate`

Eligible when Chapter 1 is complete and neither more-specific outcome was selected.

Selection priority is Civic Stabilization, Ordered Emergency, then Fractured Mandate. No outcome depends on one isolated choice. Prose and epilogues are authored later. Developer mode exposes contributing values. The fallback is intentional but never conceals invalid state; corrupted or invalid saves block resolution.

## 31. Provisional MVP Starting Baseline

These first balancing values may change after simulation and playtesting. They are not immutable story canon. Background modifiers apply afterward. All money is stored in Crown cents even though tables display VRC.

### Economy

| Variable | Starting value |
|---|---:|
| Treasury | 48,000,000 VRC |
| Monthly revenue | 12,200,000 VRC |
| Monthly expenditure | 13,800,000 VRC |
| Monthly debt service | 1,400,000 VRC |
| Arrears | 2,400,000 VRC |
| Inflation | 1120 bps |
| Unemployment | 980 bps |
| Annual growth | -120 bps |
| Currency stability | 43 |
| Food supply | 49 |
| Fuel supply | 44 |
| Industrial output | 52 |
| Agricultural output | 46 |
| Infrastructure | 50 |
| Corruption | 61 |
| Investor confidence | 38 |
| Consumer confidence | 35 |

### Government

| Variable | Starting value |
|---|---:|
| Public approval | 49 |
| Government legitimacy | 52 |
| Assembly support | 41 |
| Cabinet unity | 55 |
| Civil-service efficiency | 58 |
| Constitutional compliance | 68 |
| Press freedom | 64 |
| Election integrity | 58 |
| Emergency authority | 0 |
| Media climate | 50 |

### Security

| Variable | Starting value |
|---|---:|
| Army loyalty | 58 |
| Army readiness | 49 |
| Police loyalty | 53 |
| Intelligence loyalty | 51 |
| Presidential Guard loyalty | 65 |
| Border security | 46 |
| Foreign-infiltration risk | 58 |
| Border tension | 55 |
| Public retaliation demand | 40 |
| Intelligence uncertainty | 60 |
| Army alert level | 45 |

### International

| Variable | Starting value |
|---|---:|
| Caldris relations | 48 |
| Dromir relations | 45 |
| Dravica relations | 35 |
| Belvar relations | 62 |
| Cyrane relations | 55 |
| International reputation | 50 |
| Trade access | 52 |
| Diplomatic leverage | 44 |
| Foreign-aid dependence | 35 |
| Sanctions risk | 20 |

### Family

| Variable | Starting value |
|---|---:|
| Spouse trust | 62 |
| Daughter trust | 58 |
| Son trust | 57 |
| Sibling trust | 60 |
| Family public reputation | 55 |
| Spouse public reputation | 54 |
| Family scandal risk | 25 |

### Civic Renewal League

| Variable | Starting value |
|---|---:|
| Support | 48 |
| Trust | 55 |
| Fear | 20 |
| Organization | 58 |
| Radicalization | 24 |
| Unity | 52 |
| Government access | 55 |
| Unmet-demand severity | 35 |
| Repression memory | 10 |

### National Stewardship Union

| Variable | Starting value |
|---|---:|
| Support | 46 |
| Trust | 42 |
| Fear | 25 |
| Organization | 61 |
| Radicalization | 30 |
| Unity | 60 |
| Government access | 50 |
| Unmet-demand severity | 42 |
| Repression memory | 8 |

### Workers’ Commonwealth

| Variable | Starting value |
|---|---:|
| Support | 44 |
| Trust | 38 |
| Fear | 35 |
| Organization | 64 |
| Radicalization | 42 |
| Unity | 48 |
| Government access | 35 |
| Unmet-demand severity | 62 |
| Repression memory | 28 |

### Orsanne Metropolitan District

| Variable | Starting value |
|---|---:|
| Approval | 53 |
| Local economy | 56 |
| Unemployment | 900 bps |
| Food supply | 52 |
| Fuel supply | 48 |
| Infrastructure | 62 |
| Security tension | 42 |
| Protest intensity | 44 |
| Military presence | 25 |
| Governor trust | 54 |

### Kestrel Industrial Basin

| Variable | Starting value |
|---|---:|
| Approval | 42 |
| Local economy | 43 |
| Unemployment | 1450 bps |
| Food supply | 47 |
| Fuel supply | 40 |
| Infrastructure | 48 |
| Security tension | 58 |
| Protest intensity | 55 |
| Military presence | 35 |
| Governor trust | 40 |

### Lydra Agricultural Plain

| Variable | Starting value |
|---|---:|
| Approval | 50 |
| Local economy | 50 |
| Unemployment | 800 bps |
| Food supply | 58 |
| Fuel supply | 42 |
| Infrastructure | 44 |
| Security tension | 35 |
| Protest intensity | 35 |
| Military presence | 20 |
| Governor trust | 52 |

### Roven Marches

| Variable | Starting value |
|---|---:|
| Approval | 45 |
| Local economy | 40 |
| Unemployment | 1200 bps |
| Food supply | 44 |
| Fuel supply | 38 |
| Infrastructure | 38 |
| Security tension | 65 |
| Protest intensity | 47 |
| Military presence | 68 |
| Governor trust | 43 |

## 32. Save and Persistence Contract

Every save includes save ID, owner ID, save version, content version, revision, game seed, political period, created and updated timestamps, selected background, customizable family identity, authoritative game state, resolved-choice history, delayed effects, memories, and outcome state.

Ownership is database-enforced. Revisions prevent stale overwrites, and accepted mutations increment the revision exactly once. Idempotency keys are unique within the save's mutation scope. Related history remains linked to the save; hidden state remains server-side; snapshots retain version data.

Migration failure must not silently discard data. Content-version incompatibility produces an explicit recoverable state. JSON parsing alone does not establish save validity.

## 33. Debug and Explainability Contract

Developer mode explains why scenarios became eligible or were blocked, which conditions passed or failed, state before, effects, conditional modifiers, seed context and variation, state after, clamping or corrections, memories, flags, delayed effects, media reactions, revision change, and the reason an MVP outcome was selected.

Developer output never reaches ordinary players. Explanations use actual values and never substitute generic claims such as `The score was calculated successfully.`

## 34. Difficulty

The first playable MVP supports only `Standard`. Architecture may reserve identifiers for `Story`, `Standard`, `Statesman`, and `Iron Mandate`, but the additional modes are not implemented during the MVP.

Future difficulty may affect information visibility, economic tolerance, faction pressure, consequence hints, save restrictions, and bounded variance. It must not secretly change authored moral meaning, disable valid rules, bypass determinism, or break save compatibility without versioning.

## 35. Test and Invariant Requirements

Future implementation must test:

### Arithmetic

- Exact `MoneyMinor` calculations
- Deficit and arrears behavior
- Inflation, growth, and unemployment targets
- Revenue adjustment
- Fixed rounding behavior

### Ranges

- Every normalized score remains in `0..100`.
- Signed weights remain in `-100..100`.
- Basis-point fields stay within documented bounds.
- Invalid authored values fail validation.

### Determinism

- Equal state, content version, seed, and action produce equal results.
- UI rerendering cannot alter outcomes.
- Retry cannot reroll variation.
- Derived seed contexts remain stable.

### Mutations

- Revision increments once.
- Stale revisions are rejected.
- Duplicate idempotency keys do not duplicate effects.
- Conflicting reuse of a key fails.
- Failed transactions apply nothing.
- Resolved choices cannot resolve again.

### Delayed effects

- Due effects execute once.
- Cancelled effects do not execute.
- Failed effects block safe advancement.
- Ordering remains stable.

### Relationships and memories

- Memory decay and permanence behave correctly.
- Missing memories cannot affect dialogue.
- Relationship dimensions remain independent.

### Eligibility

- Required and excluded flags
- Impossible ranges
- Unavailable characters
- Expired scenarios
- Stable tie resolution
- No uncontrolled mandatory cycle

### Outcomes

- All three outcomes are reachable.
- Civic Stabilization and Ordered Emergency do not depend on one choice.
- Fractured Mandate is a valid deterministic fallback.
- Invalid state blocks resolution.

### Security and persistence

- Owner access and cross-user denial
- Hidden-state projection
- Save/load equality
- Content- and save-version detection

## 36. Balance Review Rules

Balance reports distinguish results proven by unit or invariant tests, observed through fixed-seed simulations, observed through playtesting, estimated, and not yet measured.

The MVP is not balanced merely because formulas exist, one route succeeds, tests compile, or values remain in range. Future simulation review must identify dominant choices, unreachable or trivial outcomes, unavoidable collapse, excessive threshold oscillation, overpowered backgrounds, faction states that never matter, regional variables that never affect content, and delayed consequences arriving too late to matter.

## 37. Deferred Systems

This MVP specification excludes:

- Full national election simulation
- Complete coup preparation and execution
- Complete strategic-war turn engine
- Naval combat and multiple war fronts
- Full parliamentary-seat simulation
- Complete industrial- and agricultural-sector simulation
- Long-term construction portfolio
- Full intelligence-agency management
- Achievement system
- Ten-chapter progression
- Full 1983–1991 timeline
- Advanced difficulty modes

Compatible foundations do not imply these systems exist.

## 38. Document Status

- Status: Foundation baseline
- Design authority: Authoritative for MVP behavior
- Implementation status: Not started
- Last reviewed commit: `b9ef050`
- Supported difficulty: Standard
- Numerical values are an initial balancing baseline.
- Future code must be tested against this specification.
- Changes require deliberate review, validation, and version control.
- This document does not expand implementation beyond `docs/MVP_SCOPE.md`.
