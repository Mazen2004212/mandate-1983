# Balancing and Determinism

## Design Goals

- Create difficult but understandable decisions.
- Avoid universally perfect policies.
- Balance short-term and long-term tradeoffs.
- Preserve multiple viable political routes.
- Make consequences explainable after the fact.
- Use hidden information without arbitrary punishment.
- Create replayability without uncontrolled randomness.

## Seeded Randomness

Require random variation to use the saved game seed and context-specific derived seeds. Make every result replayable and debuggable. Never call `Math.random()` directly in domain logic, change an outcome because a UI component rerendered, or let variation decide an entire major outcome by itself.

Use conceptual derived-seed inputs such as:

- Game seed + event ID.
- Game seed + election ID.
- Game seed + conflict ID + war turn.
- Game seed + coup faction + period.

Do not require a particular hashing implementation until the architecture selects and tests one.

## Balance Budgets

Evaluate each choice across:

- Immediate benefit and immediate cost.
- Delayed benefit and delayed cost.
- Political, faction, character, and regional effects.
- Risk.
- Information certainty.

Record intentional asymmetries. A choice need not have equal numeric costs, but its advantages, risks, and narrative uncertainty must be deliberate.

## Thresholds

- Use hysteresis where it prevents repeated threshold toggling.
- Make debug thresholds explainable.
- Avoid one-point cliffs for major outcomes unless the cliff is narratively explicit.
- Combine multiple factors for coups, wars, elections, and endings.
- Test both sides of every threshold and repeated movement across it.

## Difficulty

Support these conceptual modes:

- **Story:** Reveal more information, tolerate wider economic mistakes, reduce pressure, and offer stronger consequence hints.
- **Standard:** Apply the authored baseline for information, pressure, and variance.
- **Statesman:** Reduce certainty, tighten economy tolerance, and increase coordinated faction pressure.
- **Iron Mandate:** Apply the strictest save rules, limited information, and narrowest recovery margin while preserving deterministic fairness.

Difficulty may affect information visibility, economy tolerance, faction pressure, consequence hints, save rules, and the bounded random-variance range. Never let difficulty secretly change the authored moral meaning of a choice.

## Simulation Testing

- Run fixed-seed scenario tests.
- Test boundaries and repeated runs.
- Compare viable political routes.
- Run automated simulations when implemented.
- Inspect distributions produced by seeded variation.
- Detect unwinnable or trivially dominant routes.
- Detect impossible endings.

Keep simulation fixtures versioned with the model they assess. Investigate outliers instead of hiding them through broad clamping.

## Balance Reporting

Classify every balance claim as:

- **Proven through tests.** An automated assertion establishes a defined property.
- **Observed through simulations.** Recorded simulation output supports the claim.
- **Estimated.** Design reasoning supports the claim, but evidence is incomplete.
- **Not yet measured.** No reliable evidence exists.

Never claim a system is balanced without simulation or playtest evidence.
