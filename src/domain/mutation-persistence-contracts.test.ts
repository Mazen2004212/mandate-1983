import { describe, expect, it } from "vitest";

import {
  authoritativeSaveSchema,
  choiceResolutionHistoryEntrySchema,
  delayedEffectInstancesCollide,
  delayedEffectRuntimeIdentityKey,
  delayedEffectRuntimeStateSchema,
  delayedEffectsStateSchema,
  eventHistoryStateSchema,
  periodAdvanceHistoryEntrySchema,
  rootGameStateSchema,
} from "./index";
import {
  createValidRootStateFixture,
  createValidSaveFixture,
} from "./test/fixtures";

function choiceEntry(overrides: Readonly<Record<string, unknown>> = {}) {
  return {
    type: "choice_resolution",
    idempotencyKey: "mutation_choice_001",
    scenarioId: "scenario_contract_test",
    choiceId: "choice_contract_test",
    expectedRevision: 3,
    resultingRevision: 4,
    politicalPeriod: 1,
    resolvedAt: "1983-02-01T00:00:00.000Z",
    appliedEffectIds: ["effect_contract_one", "effect_contract_two"],
    createdMemoryIds: ["memory_contract_one"],
    addedFlagIds: ["flag_contract_added"],
    removedFlagIds: ["flag_contract_removed"],
    scheduledDelayedEffectIds: ["delay_contract_one"],
    scheduledMediaIds: ["media_contract_one"],
    ...overrides,
  };
}

function periodEntry(overrides: Readonly<Record<string, unknown>> = {}) {
  return {
    type: "period_advance",
    idempotencyKey: "mutation_period_001",
    expectedRevision: 4,
    resultingRevision: 5,
    fromPeriod: 1,
    toPeriod: 2,
    advancedAt: "1983-03-01T00:00:00.000Z",
    appliedEffectIds: ["effect_period_one"],
    executedDelayedEffectIds: ["delay_executed_one"],
    cancelledDelayedEffectIds: ["delay_cancelled_one"],
    expiredDelayedEffectIds: ["delay_expired_one"],
    failedDelayedEffectIds: ["delay_failed_one"],
    scheduledMediaIds: ["media_period_one"],
    ...overrides,
  };
}

function delayedEffect(overrides: Readonly<Record<string, unknown>> = {}) {
  return {
    id: "delay_contract_one",
    definitionContentVersion: "mvp-0.1.0",
    sourceScenarioId: "scenario_contract_test",
    sourceChoiceId: "choice_contract_test",
    sourceMutationIdempotencyKey: "mutation_choice_001",
    creationPeriod: 1,
    triggerPeriod: 2,
    priority: 100,
    effectIds: ["effect_contract_one"],
    prerequisiteConditionIds: ["condition_contract_required"],
    cancellationConditionIds: ["condition_contract_cancel"],
    expiryConditionIds: ["condition_contract_expire"],
    idempotencyScope: "choice",
    failureBehavior: "block_advancement",
    followUpContentIds: ["scenario_contract_follow_up"],
    status: "pending",
    ...overrides,
  };
}

describe("choice-resolution mutation history", () => {
  it("accepts and persists the complete request identity and receipt", () => {
    const parsed = choiceResolutionHistoryEntrySchema.parse(choiceEntry());
    expect(parsed).toEqual(choiceEntry());
    expect(parsed).toMatchObject({
      type: "choice_resolution",
      idempotencyKey: "mutation_choice_001",
      scenarioId: "scenario_contract_test",
      choiceId: "choice_contract_test",
      expectedRevision: 3,
      resolvedAt: "1983-02-01T00:00:00.000Z",
      resultingRevision: 4,
      appliedEffectIds: ["effect_contract_one", "effect_contract_two"],
      createdMemoryIds: ["memory_contract_one"],
    });
  });

  it("requires a one-revision transition", () => {
    expect(
      choiceResolutionHistoryEntrySchema.safeParse(
        choiceEntry({ resultingRevision: 5 }),
      ).success,
    ).toBe(false);
  });

  it("rejects duplicate receipt IDs", () => {
    expect(
      choiceResolutionHistoryEntrySchema.safeParse(
        choiceEntry({
          appliedEffectIds: ["effect_contract_one", "effect_contract_one"],
        }),
      ).success,
    ).toBe(false);
  });

  it("rejects invalid timestamps and unknown properties", () => {
    expect(
      choiceResolutionHistoryEntrySchema.safeParse(
        choiceEntry({ resolvedAt: "1983-02-01" }),
      ).success,
    ).toBe(false);
    expect(
      choiceResolutionHistoryEntrySchema.safeParse(
        choiceEntry({ generatedHistoryId: "history_generated" }),
      ).success,
    ).toBe(false);
  });
});

describe("period-advance mutation history", () => {
  it("accepts a complete one-period receipt", () => {
    expect(periodAdvanceHistoryEntrySchema.parse(periodEntry())).toEqual(
      periodEntry(),
    );
  });

  it("rejects skipped and backwards periods", () => {
    expect(
      periodAdvanceHistoryEntrySchema.safeParse(periodEntry({ toPeriod: 3 }))
        .success,
    ).toBe(false);
    expect(
      periodAdvanceHistoryEntrySchema.safeParse(periodEntry({ toPeriod: 0 }))
        .success,
    ).toBe(false);
  });

  it("rejects invalid revision transitions", () => {
    expect(
      periodAdvanceHistoryEntrySchema.safeParse(
        periodEntry({ resultingRevision: 6 }),
      ).success,
    ).toBe(false);
  });

  it("rejects duplicate IDs within and across terminal groups", () => {
    expect(
      periodAdvanceHistoryEntrySchema.safeParse(
        periodEntry({
          executedDelayedEffectIds: ["delay_same", "delay_same"],
        }),
      ).success,
    ).toBe(false);
    expect(
      periodAdvanceHistoryEntrySchema.safeParse(
        periodEntry({
          executedDelayedEffectIds: ["delay_same"],
          failedDelayedEffectIds: ["delay_same"],
        }),
      ).success,
    ).toBe(false);
  });
});

describe("event-history idempotency ledger", () => {
  it("accepts globally unique keys across entry types", () => {
    expect(
      eventHistoryStateSchema.safeParse([choiceEntry(), periodEntry()]).success,
    ).toBe(true);
  });

  it("rejects duplicate keys across two choice entries", () => {
    expect(
      eventHistoryStateSchema.safeParse([
        choiceEntry(),
        choiceEntry({ choiceId: "choice_contract_other" }),
      ]).success,
    ).toBe(false);
  });

  it("rejects duplicate keys across choice and period entries", () => {
    expect(
      eventHistoryStateSchema.safeParse([
        choiceEntry(),
        periodEntry({ idempotencyKey: "mutation_choice_001" }),
      ]).success,
    ).toBe(false);
  });
});

describe("delayed-effect runtime snapshots", () => {
  it("accepts and preserves a complete non-executing snapshot", () => {
    const parsed = delayedEffectRuntimeStateSchema.parse(delayedEffect());
    expect(parsed).toEqual(delayedEffect());
    expect(delayedEffectRuntimeIdentityKey(parsed)).toBe(
      "delay_contract_one:scenario_contract_test:choice_contract_test",
    );
  });

  it.each([
    "definitionContentVersion",
    "expiryConditionIds",
    "failureBehavior",
    "idempotencyScope",
  ])("rejects a snapshot missing %s", (field) => {
    const value = delayedEffect();
    Reflect.deleteProperty(value, field);
    expect(delayedEffectRuntimeStateSchema.safeParse(value).success).toBe(
      false,
    );
  });

  it("rejects trigger periods before creation", () => {
    expect(
      delayedEffectRuntimeStateSchema.safeParse(
        delayedEffect({ triggerPeriod: 0 }),
      ).success,
    ).toBe(false);
  });

  it("rejects duplicate effect and condition IDs", () => {
    expect(
      delayedEffectRuntimeStateSchema.safeParse(
        delayedEffect({ effectIds: ["effect_same", "effect_same"] }),
      ).success,
    ).toBe(false);
    expect(
      delayedEffectRuntimeStateSchema.safeParse(
        delayedEffect({
          prerequisiteConditionIds: ["condition_same", "condition_same"],
        }),
      ).success,
    ).toBe(false);
  });

  it("rejects save-, scenario-, and choice-scope collisions", () => {
    expect(
      delayedEffectsStateSchema.safeParse([
        delayedEffect({ idempotencyScope: "save" }),
        delayedEffect({
          sourceScenarioId: "scenario_contract_other",
          sourceChoiceId: "choice_contract_other",
        }),
      ]).success,
    ).toBe(false);
    expect(
      delayedEffectsStateSchema.safeParse([
        delayedEffect({ idempotencyScope: "scenario" }),
        delayedEffect({ sourceChoiceId: "choice_contract_other" }),
      ]).success,
    ).toBe(false);
    expect(
      delayedEffectsStateSchema.safeParse([delayedEffect(), delayedEffect()])
        .success,
    ).toBe(false);
  });

  it("accepts distinct scenario- and choice-scope instances", () => {
    const scenarioInstances = [
      delayedEffect({ idempotencyScope: "scenario" }),
      delayedEffect({
        idempotencyScope: "scenario",
        sourceScenarioId: "scenario_contract_other",
        sourceChoiceId: "choice_contract_other",
      }),
    ];
    const choiceInstances = [
      delayedEffect(),
      delayedEffect({ sourceChoiceId: "choice_contract_other" }),
    ];
    expect(delayedEffectsStateSchema.safeParse(scenarioInstances).success).toBe(
      true,
    );
    expect(delayedEffectsStateSchema.safeParse(choiceInstances).success).toBe(
      true,
    );
    const first = delayedEffectRuntimeStateSchema.parse(choiceInstances[0]);
    const second = delayedEffectRuntimeStateSchema.parse(choiceInstances[1]);
    expect(delayedEffectInstancesCollide(first, second)).toBe(false);
  });
});

describe("root mutation-persistence invariants", () => {
  it("accepts a delayed snapshot linked to its choice receipt", () => {
    const state = createValidRootStateFixture();
    const linked = {
      ...state,
      eventHistory: [choiceEntry()],
      delayedEffects: [delayedEffect()],
    };
    expect(rootGameStateSchema.safeParse(linked).success).toBe(true);
  });

  it("rejects missing or mismatched delayed-effect source receipts", () => {
    const state = createValidRootStateFixture();
    expect(
      rootGameStateSchema.safeParse({
        ...state,
        delayedEffects: [delayedEffect()],
      }).success,
    ).toBe(false);
    expect(
      rootGameStateSchema.safeParse({
        ...state,
        eventHistory: [choiceEntry()],
        delayedEffects: [
          delayedEffect({ sourceChoiceId: "choice_contract_other" }),
        ],
      }).success,
    ).toBe(false);
    expect(
      rootGameStateSchema.safeParse({
        ...state,
        eventHistory: [
          choiceEntry({ scheduledDelayedEffectIds: ["delay_contract_other"] }),
        ],
        delayedEffects: [delayedEffect()],
      }).success,
    ).toBe(false);
  });

  it("keeps empty new-game and authoritative-save history valid", () => {
    expect(
      rootGameStateSchema.safeParse(createValidRootStateFixture()).success,
    ).toBe(true);
    expect(
      authoritativeSaveSchema.safeParse(createValidSaveFixture()).success,
    ).toBe(true);
  });
});
