import { describe, expect, it } from "vitest";

import { authoritativeSaveSchema } from "../../../domain";
import { runtimeCondition, runtimeSave } from "../test/fixtures";
import {
  evaluateCondition,
  evaluateConditionById,
  projectConditionExplanationForPlayer,
  type ConditionEvaluationContext,
} from ".";

function context(
  conditions = [
    runtimeCondition({
      id: "condition_default",
      type: "normalized_score",
      field: "government.publicApproval",
      operator: "equals",
      unit: "normalized_score",
      expectedValue: 49,
    }),
  ],
): ConditionEvaluationContext {
  return {
    save: runtimeSave(),
    chapter: "prologue",
    registry: {
      conditions: Object.fromEntries(
        conditions.map((condition) => [condition.id, condition]),
      ),
    },
  };
}

describe("condition evaluation", () => {
  it.each([
    ["equals", 49, undefined, true],
    ["not_equals", 48, undefined, true],
    ["greater_than", 48, undefined, true],
    ["greater_than_or_equal", 49, undefined, true],
    ["less_than", 50, undefined, true],
    ["less_than_or_equal", 49, undefined, true],
    ["within_range", undefined, { minimum: 49, maximum: 49 }, true],
  ] as const)(
    "supports numeric operator %s",
    (operator, expectedValue, range, passed) => {
      const condition = runtimeCondition({
        id: `condition_numeric_${operator}`,
        type: "normalized_score",
        field: "government.publicApproval",
        operator,
        unit: "normalized_score",
        ...(expectedValue === undefined ? {} : { expectedValue }),
        ...(range === undefined ? {} : { range }),
      });
      expect(evaluateCondition(condition, context()).passed).toBe(passed);
    },
  );

  it("evaluates every numeric state-condition family through closed accessors", () => {
    const conditions = [
      runtimeCondition({
        id: "condition_bps",
        type: "basis_points",
        field: "economy.inflationBps",
        operator: "equals",
        unit: "basis_points",
        expectedValue: 1120,
      }),
      runtimeCondition({
        id: "condition_money",
        type: "money_minor",
        field: "economy.treasuryMinor",
        operator: "equals",
        unit: "money_minor",
        expectedValue: "4800000000",
      }),
      runtimeCondition({
        id: "condition_period",
        type: "political_period",
        operator: "equals",
        unit: "political_period",
        expectedValue: 0,
      }),
      runtimeCondition({
        id: "condition_relationship",
        type: "relationship_score",
        characterId: "mara_edevane",
        field: "trust",
        operator: "equals",
        unit: "normalized_score",
        expectedValue: 50,
      }),
      runtimeCondition({
        id: "condition_faction",
        type: "faction_score",
        factionId: "civic_renewal_league",
        field: "support",
        operator: "equals",
        unit: "normalized_score",
        expectedValue: 50,
      }),
      runtimeCondition({
        id: "condition_faction_region",
        type: "faction_regional_influence",
        factionId: "civic_renewal_league",
        regionId: "orsanne_metropolitan_district",
        operator: "equals",
        unit: "normalized_score",
        expectedValue: 50,
      }),
      runtimeCondition({
        id: "condition_region",
        type: "region_score",
        regionId: "orsanne_metropolitan_district",
        field: "approval",
        operator: "equals",
        unit: "normalized_score",
        expectedValue: 50,
      }),
      runtimeCondition({
        id: "condition_region_bps",
        type: "region_basis_points",
        regionId: "orsanne_metropolitan_district",
        field: "unemploymentBps",
        operator: "equals",
        unit: "basis_points",
        expectedValue: 900,
      }),
      runtimeCondition({
        id: "condition_economy_score",
        type: "normalized_score",
        field: "economy.currencyStability",
        operator: "equals",
        unit: "normalized_score",
        expectedValue: 43,
      }),
      runtimeCondition({
        id: "condition_security_score",
        type: "normalized_score",
        field: "security.armyLoyalty",
        operator: "equals",
        unit: "normalized_score",
        expectedValue: 58,
      }),
      runtimeCondition({
        id: "condition_international_score",
        type: "normalized_score",
        field: "international.caldrisRelations",
        operator: "equals",
        unit: "normalized_score",
        expectedValue: 48,
      }),
      runtimeCondition({
        id: "condition_family_score",
        type: "normalized_score",
        field: "family.spouseTrust",
        operator: "equals",
        unit: "normalized_score",
        expectedValue: 62,
      }),
    ];
    const evaluationContext = context(conditions);
    expect(
      conditions.map(
        (condition) => evaluateCondition(condition, evaluationContext).passed,
      ),
    ).toEqual(conditions.map(() => true));
  });

  it("compares money as exact bigint values beyond safe integer precision", () => {
    const source = runtimeSave();
    const value = 9_007_199_254_740_993n;
    const save = authoritativeSaveSchema.parse({
      ...source,
      authoritativeState: {
        ...source.authoritativeState,
        economy: { ...source.authoritativeState.economy, treasuryMinor: value },
      },
    });
    const condition = runtimeCondition({
      id: "condition_large_money",
      type: "money_minor",
      field: "economy.treasuryMinor",
      operator: "equals",
      unit: "money_minor",
      expectedValue: value.toString(10),
    });
    expect(
      evaluateCondition(condition, {
        save,
        chapter: "prologue",
        registry: { conditions: { [condition.id]: condition } },
      }).passed,
    ).toBe(true);
  });

  it("evaluates identity, chapter, versions, and reference operators", () => {
    const conditions = [
      runtimeCondition({
        id: "condition_background",
        type: "background",
        operator: "equals",
        expectedValue: "civil_service_reformer",
      }),
      runtimeCondition({
        id: "condition_chapter",
        type: "chapter",
        operator: "equals",
        expectedValue: "prologue",
      }),
      runtimeCondition({
        id: "condition_content_version",
        type: "content_version",
        operator: "equals",
        expectedValue: "mvp-0.1.0",
      }),
      runtimeCondition({
        id: "condition_save_version",
        type: "save_version",
        operator: "equals",
        expectedValue: "save-1.0.0",
      }),
      runtimeCondition({
        id: "condition_reference_exists",
        type: "reference",
        referenceKind: "family",
        referenceId: "spouse",
        operator: "exists",
      }),
      runtimeCondition({
        id: "condition_reference_absent",
        type: "reference",
        referenceKind: "project",
        referenceId: "project_absent",
        operator: "does_not_exist",
      }),
      runtimeCondition({
        id: "condition_reference_equals",
        type: "reference",
        referenceKind: "character_availability",
        referenceId: "mara_edevane",
        operator: "equals",
        expectedValue: "active",
      }),
      runtimeCondition({
        id: "condition_reference_not_equals",
        type: "reference",
        referenceKind: "character_availability",
        referenceId: "mara_edevane",
        operator: "not_equals",
        expectedValue: "dismissed",
      }),
      runtimeCondition({
        id: "condition_reference_contains",
        type: "reference",
        referenceKind: "flag",
        referenceId: "flag_absent",
        operator: "does_not_contain",
        expectedValue: "flag_absent",
      }),
    ];
    const evaluationContext = context(conditions);
    expect(
      conditions.every(
        (condition) => evaluateCondition(condition, evaluationContext).passed,
      ),
    ).toBe(true);
  });

  it("evaluates flag contains and memory existence against authoritative collections", () => {
    const source = runtimeSave();
    const save = authoritativeSaveSchema.parse({
      ...source,
      authoritativeState: {
        ...source.authoritativeState,
        flags: ["flag_runtime_present"],
        memories: [
          {
            id: "memory_runtime_present",
            subjectId: "mara_edevane",
            targetId: "lucien_kest",
            sourceScenarioId: "scenario_runtime_memory",
            sourceChoiceId: "choice_runtime_memory",
            emotionalWeight: 1,
            politicalWeight: 1,
            visibility: "hidden",
            creationPeriod: 0,
            decayRatePerPeriod: 0,
            permanent: true,
            dialogueInfluenceTags: [],
            eventInfluenceTags: [],
            outcomeInfluenceTags: [],
          },
        ],
      },
    });
    const flag = runtimeCondition({
      id: "condition_flag_contains",
      type: "reference",
      referenceKind: "flag",
      referenceId: "flag_runtime_present",
      operator: "contains",
      expectedValue: "flag_runtime_present",
    });
    const memory = runtimeCondition({
      id: "condition_memory_exists",
      type: "reference",
      referenceKind: "memory",
      referenceId: "memory_runtime_present",
      operator: "exists",
    });
    const evaluationContext = {
      save,
      chapter: "prologue" as const,
      registry: { conditions: { [flag.id]: flag, [memory.id]: memory } },
    };
    expect(evaluateCondition(flag, evaluationContext).passed).toBe(true);
    expect(evaluateCondition(memory, evaluationContext).passed).toBe(true);
  });

  it("evaluates all, any, and none recursively and fails closed on missing or cyclic IDs", () => {
    const passing = runtimeCondition({
      id: "condition_passing",
      type: "chapter",
      operator: "equals",
      expectedValue: "prologue",
    });
    const failing = runtimeCondition({
      id: "condition_failing",
      type: "chapter",
      operator: "not_equals",
      expectedValue: "prologue",
    });
    const all = runtimeCondition({
      id: "condition_all",
      type: "compound",
      operator: "all",
      conditionIds: [passing.id, passing.id],
    });
    const any = runtimeCondition({
      id: "condition_any",
      type: "compound",
      operator: "any",
      conditionIds: [failing.id, passing.id],
    });
    const none = runtimeCondition({
      id: "condition_none",
      type: "compound",
      operator: "none",
      conditionIds: [failing.id],
    });
    const missing = runtimeCondition({
      id: "condition_missing_parent",
      type: "compound",
      operator: "all",
      conditionIds: ["condition_not_registered"],
    });
    const cycleA = runtimeCondition({
      id: "condition_cycle_a",
      type: "compound",
      operator: "all",
      conditionIds: ["condition_cycle_b"],
    });
    const cycleB = runtimeCondition({
      id: "condition_cycle_b",
      type: "compound",
      operator: "all",
      conditionIds: ["condition_cycle_a"],
    });
    const conditions = [
      passing,
      failing,
      all,
      any,
      none,
      missing,
      cycleA,
      cycleB,
    ];
    const evaluationContext = context(conditions);
    expect(
      [all, any, none].map(
        (item) => evaluateCondition(item, evaluationContext).passed,
      ),
    ).toEqual([true, true, true]);
    expect(evaluateCondition(missing, evaluationContext).failureCode).toBe(
      "condition_failed",
    );
    const cycle = evaluateConditionById(cycleA.id, evaluationContext);
    expect(cycle.passed).toBe(false);
    expect(cycle.children[0]?.children[0]?.failureCode).toBe(
      "cyclic_condition",
    );
  });

  it("is deterministic and does not mutate condition, registry, or save input", () => {
    const condition = runtimeCondition({
      id: "condition_purity",
      type: "normalized_score",
      field: "government.publicApproval",
      operator: "equals",
      unit: "normalized_score",
      expectedValue: 49,
    });
    const evaluationContext = context([condition]);
    const beforeCondition = structuredClone(condition);
    const beforeContext = structuredClone(evaluationContext);
    const first = evaluateCondition(condition, evaluationContext);
    const second = evaluateCondition(condition, evaluationContext);
    expect(second).toEqual(first);
    expect(condition).toEqual(beforeCondition);
    expect(evaluationContext).toEqual(beforeContext);
  });
});

describe("safe condition explanations", () => {
  it("shows exact values only for exact player-visible classifications", () => {
    const exact = runtimeCondition({
      id: "condition_exact",
      type: "money_minor",
      field: "economy.treasuryMinor",
      operator: "equals",
      unit: "money_minor",
      expectedValue: "4800000000",
      visibility: "player_visible_exact",
    });
    const qualitative = runtimeCondition({
      ...exact,
      id: "condition_qualitative",
      visibility: "player_visible_qualitative",
    });
    const hidden = runtimeCondition({
      ...exact,
      id: "condition_hidden",
      visibility: "hidden",
    });
    const evaluationContext = context([exact, qualitative, hidden]);
    expect(
      projectConditionExplanationForPlayer(
        evaluateCondition(exact, evaluationContext),
      ),
    ).toMatchObject({
      actualValue: "4800000000",
      expectedValue: "4800000000",
    });
    expect(
      projectConditionExplanationForPlayer(
        evaluateCondition(qualitative, evaluationContext),
      ),
    ).not.toHaveProperty("actualValue");
    expect(
      projectConditionExplanationForPlayer(
        evaluateCondition(hidden, evaluationContext),
      ),
    ).toBeNull();
  });

  it("suppresses developer, report-dependent, and hidden compound child detail", () => {
    const hidden = runtimeCondition({
      id: "condition_hidden_child",
      type: "normalized_score",
      field: "government.publicApproval",
      operator: "equals",
      unit: "normalized_score",
      expectedValue: 49,
      visibility: "hidden",
    });
    const report = runtimeCondition({
      ...hidden,
      id: "condition_report_dependent",
      visibility: "report_dependent",
    });
    const developer = runtimeCondition({
      ...hidden,
      id: "condition_developer_only",
      visibility: "developer_only",
    });
    const compound = runtimeCondition({
      id: "condition_public_compound",
      type: "compound",
      operator: "all",
      conditionIds: [hidden.id],
      visibility: "public",
    });
    const evaluationContext = context([hidden, report, developer, compound]);
    expect(
      projectConditionExplanationForPlayer(
        evaluateCondition(report, evaluationContext),
      ),
    ).toBeNull();
    expect(
      projectConditionExplanationForPlayer(
        evaluateCondition(developer, evaluationContext),
      ),
    ).toBeNull();
    const result = evaluateCondition(compound, evaluationContext);
    const projected = projectConditionExplanationForPlayer(result);
    expect(projected?.children).toEqual([]);
    expect(projected?.passed).toBe(result.passed);
  });
});
