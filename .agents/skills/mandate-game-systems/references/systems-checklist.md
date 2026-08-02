# Game Systems Delivery Checklist

## Contents

- [Before Implementation](#before-implementation)
- [Domain Model](#domain-model)
- [Mutation Safety](#mutation-safety)
- [Consequences](#consequences)
- [Determinism](#determinism)
- [Persistence](#persistence)
- [Tests](#tests)
- [System-Specific](#system-specific)
- [Delivery Report](#delivery-report)

## Before Implementation

- [ ] `AGENTS.md` read.
- [ ] Relevant system files inspected.
- [ ] Inputs identified.
- [ ] Outputs identified.
- [ ] Consumers identified.
- [ ] Persistence impact identified.
- [ ] Migration impact identified.
- [ ] Visibility classified.
- [ ] Seed behavior identified.
- [ ] Test strategy identified.

## Domain Model

- [ ] Strict TypeScript used.
- [ ] No `any` introduced.
- [ ] Valid ranges defined.
- [ ] Units explicit.
- [ ] Money exact.
- [ ] Hidden state separated.
- [ ] Immutable definitions separated.
- [ ] Runtime state versioned.
- [ ] Domain logic has no React dependency.

## Mutation Safety

- [ ] Input schema defined.
- [ ] Preconditions enforced.
- [ ] Authorization enforced.
- [ ] Idempotency enforced.
- [ ] Save revision checked.
- [ ] Transaction behavior defined.
- [ ] Event log written.
- [ ] Duplicate execution prevented.
- [ ] Error behavior defined.
- [ ] Rollback or recovery behavior defined.

## Consequences

- [ ] Immediate effects covered.
- [ ] Delayed effects covered.
- [ ] Cumulative effects covered.
- [ ] Threshold effects covered.
- [ ] Political effects covered.
- [ ] Faction effects covered.
- [ ] Character effects covered.
- [ ] Regional effects covered.
- [ ] Media effects covered.
- [ ] Economy effects covered.
- [ ] War effects covered.
- [ ] Hidden effects classified.

## Determinism

- [ ] Seed source documented.
- [ ] Derived seed documented.
- [ ] No direct `Math.random()` used in domain logic.
- [ ] Replay stable.
- [ ] Debug seed visible to developers only.
- [ ] Deterministic tests pass.

## Persistence

- [ ] Save schema updated.
- [ ] Migration created if required.
- [ ] Migration tested.
- [ ] Old save tested.
- [ ] New save tested.
- [ ] Concurrent revision tested.
- [ ] Silent overwrite prevented.

## Tests

- [ ] Unit tests run.
- [ ] Invariant tests run.
- [ ] Edge cases covered.
- [ ] Duplicate prevention covered.
- [ ] Delayed execution covered.
- [ ] Seed stability covered.
- [ ] Migration covered.
- [ ] Error paths covered.
- [ ] Debug explanation checked.

## System-Specific

### Economy

- [ ] Exact arithmetic.
- [ ] Period resolution.
- [ ] Project timeline.
- [ ] Delayed benefit.
- [ ] Corruption.
- [ ] Regional effect.

### Elections

- [ ] Regional result.
- [ ] Turnout.
- [ ] Integrity.
- [ ] Fraud.
- [ ] Media.
- [ ] Economy.
- [ ] War.
- [ ] Deterministic result.

### Coups

- [ ] Intent.
- [ ] Capability.
- [ ] Discovery.
- [ ] Execution.
- [ ] Loyalist response.
- [ ] Final resolution.

### War

- [ ] Logistics.
- [ ] Readiness.
- [ ] Morale.
- [ ] Leadership.
- [ ] Terrain.
- [ ] Intelligence.
- [ ] Foreign support.
- [ ] Seeded variation.
- [ ] Civilian impact.
- [ ] Peace leverage.

### Endings

- [ ] Multi-variable eligibility.
- [ ] Priority.
- [ ] Mutual exclusion.
- [ ] Deterministic selection.
- [ ] Epilogue inputs.

## Delivery Report

- [ ] System reported.
- [ ] Files reported.
- [ ] Types reported.
- [ ] State changes reported.
- [ ] Persistence changes reported.
- [ ] Tests reported.
- [ ] Invariants reported.
- [ ] Seeds reported.
- [ ] Migrations reported.
- [ ] Limitations reported.
- [ ] Skipped checks reported with reasons.

A game system is not complete merely because one expected scenario works.
It must remain correct across edge cases, repeated execution, save/load,
migrations, and deterministic replay.
