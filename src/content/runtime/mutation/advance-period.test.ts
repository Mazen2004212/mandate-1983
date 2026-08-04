import { describe, expect, it } from "vitest";

import { authoritativeSaveSchema } from "../../../domain";
import { advancePeriod } from "./advance-period";
import { resolveChoice } from "./resolve-choice";
import {
  advanceInput,
  delayedDefinition,
  mutationRegistry,
  mutationSave,
  normalizedCondition,
  normalizedEffect,
  regionBasisPointEffect,
  resolveInput,
} from "./test/fixtures";

function expectFailure(result: ReturnType<typeof advancePeriod>, code: string) {
  expect(result.status).toBe("failure");
  if (result.status === "failure") expect(result.code).toBe(code);
}

function scheduledSave(options: {
  readonly delayedOverrides?: Readonly<Record<string, unknown>>;
  readonly effect?: unknown;
  readonly conditions?: readonly unknown[];
}) {
  const effect =
    options.effect ?? normalizedEffect({ id: "effect_due", value: 7 });
  const effectId =
    typeof effect === "object" && effect !== null && "id" in effect
      ? String(effect.id)
      : "effect_due";
  const delayed = delayedDefinition("delayed_due", [effectId], {
    ...options.delayedOverrides,
  });
  const registry = mutationRegistry({
    choiceOverrides: { baseEffects: [], delayedEffects: [delayed.id] },
    effects: [effect],
    conditions: options.conditions ?? [],
    delayedEffects: [delayed],
  });
  const resolution = resolveChoice(resolveInput(mutationSave(), registry));
  if (resolution.status !== "applied") {
    throw new Error("Could not schedule the delayed-effect fixture.");
  }
  return { save: resolution.save, registry, delayed, effect };
}

describe("one-period advancement", () => {
  it("advances exactly one period, one revision, and appends one receipt", () => {
    const save = mutationSave();
    const registry = mutationRegistry();
    const result = advancePeriod(advanceInput(save, registry));

    expect(result.status).toBe("applied");
    if (result.status !== "applied") return;
    expect(result.previousRevision).toBe(0);
    expect(result.resultingRevision).toBe(1);
    expect(result.fromPeriod).toBe(0);
    expect(result.toPeriod).toBe(1);
    expect(result.save.politicalPeriod).toBe(1);
    expect(result.save.authoritativeState.timeline.politicalPeriod).toBe(1);
    expect(result.receipt).toMatchObject({
      type: "period_advance",
      fromPeriod: 0,
      toPeriod: 1,
      expectedRevision: 0,
      resultingRevision: 1,
    });
    expect(authoritativeSaveSchema.safeParse(result.save).success).toBe(true);
  });

  it("rejects backward, same-period, and skipped-period requests", () => {
    const save = mutationSave();
    const registry = mutationRegistry();
    for (const targetPeriod of [0, 2]) {
      expectFailure(
        advancePeriod({
          ...advanceInput(save, registry),
          targetPeriod,
        }),
        "invalid_input",
      );
    }
  });

  it("rejects malformed input, invalid saves, stale revisions, and unsupported versions", () => {
    expectFailure(advancePeriod({}), "invalid_input");
    const save = mutationSave();
    const registry = mutationRegistry();
    expectFailure(
      advancePeriod({ ...advanceInput(save, registry), save: {} }),
      "invalid_save",
    );
    expectFailure(
      advancePeriod({
        ...advanceInput(save, registry),
        expectedRevision: save.revision + 1,
      }),
      "revision_conflict",
    );
    expectFailure(
      advancePeriod({
        ...advanceInput(save, registry),
        save: { ...save, contentVersion: "mvp-0.2.0" },
      }),
      "unsupported_version",
    );
  });

  it("returns a stable persisted receipt before rejecting its stale revision", () => {
    const save = mutationSave();
    const registry = mutationRegistry();
    const input = advanceInput(save, registry);
    const first = advancePeriod(input);
    expect(first.status).toBe("applied");
    if (first.status !== "applied") return;
    const retry = advancePeriod({ ...input, save: first.save });
    expect(retry.status).toBe("already_applied");
    if (retry.status === "already_applied") {
      expect(retry.receipt).toEqual(first.receipt);
      expect(retry.save).toEqual(first.save);
    }
  });

  it("detects an idempotency-key conflict across period request identities", () => {
    const save = mutationSave();
    const registry = mutationRegistry();
    const input = advanceInput(save, registry);
    const first = advancePeriod(input);
    expect(first.status).toBe("applied");
    if (first.status !== "applied") return;
    expectFailure(
      advancePeriod({
        ...input,
        save: first.save,
        advancedAt: "1983-02-02T00:00:00.000Z",
      }),
      "idempotency_conflict",
    );
  });

  it("does not run TASK-09 economy or government formulas", () => {
    const save = mutationSave();
    const registry = mutationRegistry();
    const beforeEconomy = structuredClone(save.authoritativeState.economy);
    const beforeGovernment = structuredClone(
      save.authoritativeState.government,
    );
    const result = advancePeriod(advanceInput(save, registry));
    expect(result.status).toBe("applied");
    if (result.status !== "applied") return;
    expect(result.save.authoritativeState.economy).toEqual(beforeEconomy);
    expect(result.save.authoritativeState.government).toEqual(beforeGovernment);
  });

  it("does not mutate the input save or content registry", () => {
    const save = mutationSave();
    const registry = mutationRegistry();
    const before = structuredClone(save);
    advancePeriod(advanceInput(save, registry));
    expect(save).toEqual(before);
    expect(Object.isFrozen(registry)).toBe(true);
  });

  it("fails atomically when the final timestamp violates save chronology", () => {
    const save = mutationSave();
    const before = structuredClone(save);
    const registry = mutationRegistry();
    expectFailure(
      advancePeriod({
        ...advanceInput(save, registry),
        advancedAt: "1982-12-31T00:00:00.000Z",
      }),
      "final_validation_failure",
    );
    expect(save).toEqual(before);
  });
});

describe("due delayed-effect processing", () => {
  it("leaves future work pending and executes it exactly once when due", () => {
    const fixture = scheduledSave({ delayedOverrides: { triggerPeriod: 2 } });
    const first = advancePeriod(advanceInput(fixture.save, fixture.registry));
    expect(first.status).toBe("applied");
    if (first.status !== "applied") return;
    expect(first.save.authoritativeState.delayedEffects[0]?.status).toBe(
      "pending",
    );
    expect(first.save.authoritativeState.government.publicApproval).toBe(49);

    const second = advancePeriod(advanceInput(first.save, fixture.registry));
    expect(second.status).toBe("applied");
    if (second.status !== "applied") return;
    expect(second.save.authoritativeState.delayedEffects[0]?.status).toBe(
      "executed",
    );
    expect(second.save.authoritativeState.government.publicApproval).toBe(56);
    expect(second.receipt.executedDelayedEffectIds).toEqual(["delayed_due"]);
  });

  it("cancels due work before payload execution when a cancellation condition passes", () => {
    const condition = normalizedCondition("condition_cancel", 40);
    const fixture = scheduledSave({
      delayedOverrides: { cancellationConditions: [condition.id] },
      conditions: [condition],
    });
    const result = advancePeriod(advanceInput(fixture.save, fixture.registry));
    expect(result.status).toBe("applied");
    if (result.status !== "applied") return;
    expect(result.save.authoritativeState.delayedEffects[0]?.status).toBe(
      "cancelled",
    );
    expect(result.save.authoritativeState.government.publicApproval).toBe(49);
    expect(result.receipt.cancelledDelayedEffectIds).toEqual(["delayed_due"]);
  });

  it("expires due work before prerequisites and payload execution", () => {
    const condition = normalizedCondition("condition_expire", 40);
    const fixture = scheduledSave({
      delayedOverrides: { expiryConditions: [condition.id] },
      conditions: [condition],
    });
    const result = advancePeriod(advanceInput(fixture.save, fixture.registry));
    expect(result.status).toBe("applied");
    if (result.status !== "applied") return;
    expect(result.save.authoritativeState.delayedEffects[0]?.status).toBe(
      "expired",
    );
    expect(result.receipt.expiredDelayedEffectIds).toEqual(["delayed_due"]);
  });

  it("keeps due work pending while a prerequisite is false", () => {
    const condition = normalizedCondition("condition_wait", 100);
    const fixture = scheduledSave({
      delayedOverrides: { prerequisites: [condition.id] },
      conditions: [condition],
    });
    const result = advancePeriod(advanceInput(fixture.save, fixture.registry));
    expect(result.status).toBe("applied");
    if (result.status !== "applied") return;
    expect(result.save.authoritativeState.delayedEffects[0]?.status).toBe(
      "pending",
    );
    expect(result.receipt.executedDelayedEffectIds).toEqual([]);
  });

  it("rolls back and marks a failed delayed payload according to authored behavior", () => {
    const effect = regionBasisPointEffect("effect_invalid_due", {
      value: 4_000,
    });
    const fixture = scheduledSave({
      effect,
      delayedOverrides: { failureBehavior: "mark_failed" },
    });
    const result = advancePeriod(advanceInput(fixture.save, fixture.registry));
    expect(result.status).toBe("applied");
    if (result.status !== "applied") return;
    expect(result.save.authoritativeState.delayedEffects[0]?.status).toBe(
      "failed",
    );
    expect(result.receipt.failedDelayedEffectIds).toEqual(["delayed_due"]);
    expect(result.receipt.appliedEffectIds).toEqual([]);
  });

  it("rolls back and cancels a failed delayed payload according to authored behavior", () => {
    const effect = regionBasisPointEffect("effect_cancel_due", {
      value: 4_000,
    });
    const fixture = scheduledSave({
      effect,
      delayedOverrides: { failureBehavior: "cancel" },
    });
    const result = advancePeriod(advanceInput(fixture.save, fixture.registry));
    expect(result.status).toBe("applied");
    if (result.status !== "applied") return;
    expect(result.save.authoritativeState.delayedEffects[0]?.status).toBe(
      "cancelled",
    );
    expect(result.receipt.cancelledDelayedEffectIds).toEqual(["delayed_due"]);
  });

  it("blocks atomically when an authored blocking payload fails", () => {
    const effect = regionBasisPointEffect("effect_block_due", {
      value: 4_000,
    });
    const fixture = scheduledSave({ effect });
    const before = structuredClone(fixture.save);
    const result = advancePeriod(advanceInput(fixture.save, fixture.registry));
    expectFailure(result, "delayed_effect_failure");
    expect(fixture.save).toEqual(before);
  });

  it("orders due work by trigger period, descending priority, then authored ID", () => {
    const effects = [
      normalizedEffect({ id: "effect_alpha", value: 1 }),
      normalizedEffect({ id: "effect_beta", value: 2 }),
      normalizedEffect({ id: "effect_gamma", value: 3 }),
    ];
    const delayed = [
      delayedDefinition("delayed_beta", ["effect_beta"], { priority: 5 }),
      delayedDefinition("delayed_alpha", ["effect_alpha"], { priority: 5 }),
      delayedDefinition("delayed_gamma", ["effect_gamma"], { priority: 10 }),
    ];
    const registry = mutationRegistry({
      choiceOverrides: {
        baseEffects: [],
        delayedEffects: delayed.map(({ id }) => id),
      },
      effects,
      delayedEffects: delayed,
    });
    const resolution = resolveChoice(resolveInput(mutationSave(), registry));
    expect(resolution.status).toBe("applied");
    if (resolution.status !== "applied") return;
    const result = advancePeriod(advanceInput(resolution.save, registry));
    expect(result.status).toBe("applied");
    if (result.status !== "applied") return;
    expect(result.receipt.executedDelayedEffectIds).toEqual([
      "delayed_gamma",
      "delayed_alpha",
      "delayed_beta",
    ]);
    expect(result.receipt.appliedEffectIds).toEqual([
      "effect_gamma",
      "effect_alpha",
      "effect_beta",
    ]);
  });

  it("applies a delayed payload when its effect condition passes", () => {
    const condition = normalizedCondition("condition_payload_pass", 40);
    const effect = normalizedEffect({
      id: "effect_condition_pass",
      value: 7,
      applicableConditionIds: [condition.id],
    });
    const fixture = scheduledSave({ effect, conditions: [condition] });
    const result = advancePeriod(advanceInput(fixture.save, fixture.registry));
    expect(result.status).toBe("applied");
    if (result.status !== "applied") return;
    expect(result.save.authoritativeState.government.publicApproval).toBe(56);
    expect(result.receipt.appliedEffectIds).toEqual([effect.id]);
    expect(result.receipt.executedDelayedEffectIds).toEqual(["delayed_due"]);
  });

  it("skips a delayed payload when its effect condition fails", () => {
    const condition = normalizedCondition("condition_payload_fail", 100);
    const effect = normalizedEffect({
      id: "effect_condition_fail",
      value: 7,
      applicableConditionIds: [condition.id],
    });
    const fixture = scheduledSave({ effect, conditions: [condition] });
    const result = advancePeriod(advanceInput(fixture.save, fixture.registry));
    expect(result.status).toBe("applied");
    if (result.status !== "applied") return;
    expect(result.save.authoritativeState.government.publicApproval).toBe(49);
    expect(result.receipt.appliedEffectIds).toEqual([]);
    expect(result.evidence.skippedEffectIds).toEqual([effect.id]);
    expect(result.receipt.executedDelayedEffectIds).toEqual(["delayed_due"]);
  });

  it("is deterministic for identical delayed-effect inputs", () => {
    const left = scheduledSave({});
    const right = scheduledSave({});
    expect(advancePeriod(advanceInput(left.save, left.registry))).toEqual(
      advancePeriod(advanceInput(right.save, right.registry)),
    );
  });
});
