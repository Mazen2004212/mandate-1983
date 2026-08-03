import { describe, expect, it } from "vitest";

import {
  resolvedChoiceHistoryEntrySchema,
  seedValueSchema,
} from "../../../domain";
import {
  runtimeRegistry,
  runtimeSave,
  runtimeScenario,
} from "../test/fixtures";
import {
  projectScheduleExplanationForPlayer,
  scheduleScenario,
  SCENARIO_SCHEDULER_JITTER_NAMESPACE,
  type ScenarioSchedulerContext,
} from ".";

function context(
  scenarios: readonly ReturnType<typeof runtimeScenario>[],
  overrides: Partial<ScenarioSchedulerContext> = {},
): ScenarioSchedulerContext {
  return {
    registry: runtimeRegistry({ scenarios }),
    save: runtimeSave(),
    chapter: "prologue",
    history: [],
    politicalPeriod: 0,
    attemptIndex: 0,
    periodsWaiting: {},
    dueDirectFollowUpIds: [],
    ...overrides,
  };
}

describe("deterministic scenario scheduler", () => {
  it("orders due direct follow-ups, mandatory, major, optional, ambient, then outcomes", () => {
    const scenarios = [
      runtimeScenario("scenario_tier_outcome", {
        category: "outcome",
        priority: 10_000,
      }),
      runtimeScenario("scenario_tier_ambient", {
        category: "ambient_media",
        priority: 10_000,
      }),
      runtimeScenario("scenario_tier_optional", {
        category: "optional",
        priority: 10_000,
      }),
      runtimeScenario("scenario_tier_major", {
        category: "major",
        priority: 10_000,
      }),
      runtimeScenario("scenario_tier_mandatory", {
        category: "mandatory",
        priority: 10_000,
      }),
      runtimeScenario("scenario_tier_direct", {
        category: "direct_follow_up",
        priority: 0,
      }),
    ];
    const result = scheduleScenario(
      context(scenarios, { dueDirectFollowUpIds: ["scenario_tier_direct"] }),
    );
    expect(result.selectedScenarioId).toBe("scenario_tier_direct");
    expect(
      result.candidates.map((candidate) => candidate.scenario.category),
    ).toEqual([
      "direct_follow_up",
      "mandatory",
      "major",
      "optional",
      "ambient_media",
      "outcome",
    ]);
  });

  it("uses the documented effective-priority formula and caps waiting at nine", () => {
    const scenario = runtimeScenario("scenario_priority_formula", {
      priority: 7,
      urgency: 4,
    });
    const result = scheduleScenario(
      context([scenario], { periodsWaiting: { [scenario.id]: 100 } }),
    );
    const candidate = result.candidates[0];
    expect(candidate?.waitingContribution).toBe(9);
    expect(candidate?.effectivePriority).toBe(
      7 * 100 + 4 * 10 + 9 + (candidate?.jitter ?? 0),
    );
  });

  it("orders priority and urgency before jitter within a category", () => {
    const highPriority = runtimeScenario("scenario_priority_high", {
      priority: 2,
      urgency: 0,
    });
    const lowPriority = runtimeScenario("scenario_priority_low", {
      priority: 1,
      urgency: 0,
    });
    expect(
      scheduleScenario(context([lowPriority, highPriority])).selectedScenarioId,
    ).toBe(highPriority.id);

    const highUrgency = runtimeScenario("scenario_urgency_high", {
      priority: 1,
      urgency: 2,
    });
    const lowUrgency = runtimeScenario("scenario_urgency_low", {
      priority: 1,
      urgency: 1,
    });
    expect(
      scheduleScenario(context([lowUrgency, highUrgency])).selectedScenarioId,
    ).toBe(highUrgency.id);
  });

  it("derives stable jitter from the complete authored seed context", () => {
    const scenario = runtimeScenario("scenario_seed_context");
    const first = scheduleScenario(context([scenario]));
    const repeated = scheduleScenario(context([scenario]));
    const nextAttempt = scheduleScenario(
      context([scenario], { attemptIndex: 1 }),
    );
    expect(repeated).toEqual(first);
    expect(first.candidates[0]?.jitter).toBeGreaterThanOrEqual(0);
    expect(first.candidates[0]?.jitter).toBeLessThanOrEqual(9);
    expect(first.candidates[0]?.jitterExplanation.namespace).toBe(
      SCENARIO_SCHEDULER_JITTER_NAMESPACE,
    );
    expect(
      first.candidates[0]?.jitterExplanation.canonicalSeedContext,
    ).not.toBe(
      nextAttempt.candidates[0]?.jitterExplanation.canonicalSeedContext,
    );
    expect(nextAttempt.candidates[0]?.jitterExplanation.attemptIndex).toBe(1);
  });

  it("separates deterministic streams by period and game seed", () => {
    const scenario = runtimeScenario("scenario_seed_separation");
    const baseline = scheduleScenario(context([scenario]));
    const periodSave = runtimeSave(1);
    const nextPeriod = scheduleScenario(
      context([scenario], { save: periodSave, politicalPeriod: 1 }),
    );
    const source = runtimeSave();
    const otherSeed = scheduleScenario(
      context([scenario], {
        save: {
          ...source,
          gameSeed: seedValueSchema.parse("different_seed_value_1983"),
        },
      }),
    );
    expect(
      nextPeriod.candidates[0]?.jitterExplanation.canonicalSeedContext,
    ).not.toBe(baseline.candidates[0]?.jitterExplanation.canonicalSeedContext);
    expect(
      otherSeed.candidates[0]?.jitterExplanation.canonicalSeedContext,
    ).not.toBe(baseline.candidates[0]?.jitterExplanation.canonicalSeedContext);
  });

  it("produces stable seeded jitter collisions without relying on input order", () => {
    const scenarios = Array.from({ length: 11 }, (_, index) =>
      runtimeScenario(
        `scenario_jitter_collision_${index.toString().padStart(2, "0")}`,
      ),
    );
    const result = scheduleScenario(context(scenarios));
    const counts = new Map<number, number>();
    result.candidates.forEach((candidate) =>
      counts.set(candidate.jitter, (counts.get(candidate.jitter) ?? 0) + 1),
    );
    expect([...counts.values()].some((count) => count > 1)).toBe(true);
    expect(scheduleScenario(context([...scenarios].reverse()))).toEqual(result);
  });

  it("uses stable authored-ID ordering when ranked values tie exactly", () => {
    const alpha = runtimeScenario("scenario_tie_alpha");
    const beta = runtimeScenario("scenario_tie_beta");
    const initial = scheduleScenario(context([beta, alpha]));
    const alphaJitter = initial.candidates.find(
      (candidate) => candidate.scenarioId === alpha.id,
    )?.jitter;
    const betaJitter = initial.candidates.find(
      (candidate) => candidate.scenarioId === beta.id,
    )?.jitter;
    expect(alphaJitter).toBeDefined();
    expect(betaJitter).toBeDefined();
    const alphaWaiting = Math.max((betaJitter ?? 0) - (alphaJitter ?? 0), 0);
    const betaWaiting = Math.max((alphaJitter ?? 0) - (betaJitter ?? 0), 0);
    const tied = scheduleScenario(
      context([beta, alpha], {
        periodsWaiting: {
          [alpha.id]: alphaWaiting,
          [beta.id]: betaWaiting,
        },
      }),
    );
    expect(tied.candidates[0]?.effectivePriority).toBe(
      tied.candidates[1]?.effectivePriority,
    );
    expect(tied.selectedScenarioId).toBe(alpha.id);
  });

  it("requires direct follow-ups to be explicitly due", () => {
    const direct = runtimeScenario("scenario_direct_not_due", {
      category: "direct_follow_up",
    });
    const optional = runtimeScenario("scenario_direct_fallback");
    const result = scheduleScenario(context([direct, optional]));
    expect(result.selectedScenarioId).toBe(optional.id);
    expect(
      result.candidates.find((candidate) => candidate.scenarioId === direct.id)
        ?.schedulerBlockingReasons,
    ).not.toHaveLength(0);
  });

  it("returns an explicit no-selection result when no scenario is eligible", () => {
    const future = runtimeScenario("scenario_no_selection", {
      politicalPeriodWindow: { minimum: 1, maximum: 2 },
    });
    expect(scheduleScenario(context([future]))).toMatchObject({
      status: "no_eligible_scenario",
      selectedScenarioId: null,
      selectedScenario: null,
    });
  });

  it("never selects expired or completed non-repeatable scenarios", () => {
    const expired = runtimeScenario("scenario_scheduler_expired", {
      politicalPeriodWindow: { minimum: 0, maximum: 0 },
    });
    const completed = runtimeScenario("scenario_scheduler_completed");
    const available = runtimeScenario("scenario_scheduler_available");
    const history = [
      resolvedChoiceHistoryEntrySchema.parse({
        type: "choice_resolution",
        idempotencyKey: "scheduler_completed_resolution",
        scenarioId: completed.id,
        choiceId: "choice_scheduler_completed",
        expectedRevision: 0,
        resultingRevision: 1,
        politicalPeriod: 0,
        resolvedAt: "1983-01-01T00:00:00.000Z",
        appliedEffectIds: [],
        createdMemoryIds: [],
        addedFlagIds: [],
        removedFlagIds: [],
        scheduledDelayedEffectIds: [],
        scheduledMediaIds: [],
      }),
    ];
    const save = runtimeSave(1);
    const result = scheduleScenario(
      context([expired, completed, available], {
        save,
        politicalPeriod: 1,
        history,
      }),
    );
    expect(result.selectedScenarioId).toBe(available.id);
    expect(
      result.candidates
        .filter((candidate) => candidate.scenarioId !== available.id)
        .every((candidate) => !candidate.eligible),
    ).toBe(true);
  });

  it("does not mutate registry, save, history, or scheduler inputs", () => {
    const scenario = runtimeScenario("scenario_zero_mutation");
    const schedulerContext = context([scenario], {
      periodsWaiting: { [scenario.id]: 3 },
    });
    const before = structuredClone(schedulerContext);
    scheduleScenario(schedulerContext);
    expect(schedulerContext).toEqual(before);
  });

  it("produces identical results regardless of registry insertion order", () => {
    const alpha = runtimeScenario("scenario_input_alpha");
    const beta = runtimeScenario("scenario_input_beta");
    const first = scheduleScenario(context([alpha, beta]));
    const second = scheduleScenario(context([beta, alpha]));
    expect(second).toEqual(first);
  });

  it("rejects mismatched periods and invalid explicit waiting input", () => {
    const scenario = runtimeScenario("scenario_invalid_scheduler_input");
    expect(() =>
      scheduleScenario(context([scenario], { politicalPeriod: 1 })),
    ).toThrow(RangeError);
    expect(() =>
      scheduleScenario(
        context([scenario], { periodsWaiting: { [scenario.id]: -1 } }),
      ),
    ).toThrow(RangeError);
  });

  it("projects player explanations without seeds, jitter, IDs, or developer detail", () => {
    const scenario = runtimeScenario("scenario_projection_safe");
    const player = projectScheduleExplanationForPlayer(
      scheduleScenario(context([scenario])),
    );
    const serialized = JSON.stringify(player);
    expect(serialized).not.toContain("test_seed_value_1983");
    expect(serialized).not.toContain("canonicalSeedContext");
    expect(serialized).not.toContain("jitter");
    expect(serialized).not.toContain(scenario.id);
  });

  it("includes complete ranking and deterministic evidence in developer candidates", () => {
    const scenario = runtimeScenario("scenario_developer_evidence", {
      priority: 3,
      urgency: 2,
    });
    const candidate = scheduleScenario(
      context([scenario], { periodsWaiting: { [scenario.id]: 4 } }),
    ).candidates[0];
    expect(candidate).toMatchObject({
      scenarioId: scenario.id,
      categoryRank: 2,
      basePriority: 3,
      urgency: 2,
      periodsWaiting: 4,
      waitingContribution: 4,
    });
    expect(candidate?.jitterExplanation.canonicalSeedContext).toContain(
      SCENARIO_SCHEDULER_JITTER_NAMESPACE,
    );
    expect(Object.isFrozen(candidate)).toBe(true);
  });
});
