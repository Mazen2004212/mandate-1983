import { describe, expect, it } from "vitest";

import {
  CONDITIONAL_EFFECT_TIMINGS,
  FACTION_SCORE_FIELDS,
  NORMALIZED_STATE_FIELDS,
  REGION_SCORE_FIELDS,
  RELATIONSHIP_SCORE_FIELDS,
} from "./constants";
import { effectSchema } from "./schemas/effects";
import { choiceSchema } from "./schemas/scenario";
import {
  MUTATION_CHOICE_ID,
  MUTATION_SCENARIO_ID,
  mutationChoice,
  mutationProject,
  mutationRegistry,
  normalizedEffect,
  regionProjectMembershipEffect,
} from "./runtime/mutation/test/fixtures";

const EFFECT_BASE = {
  id: "effect_contract_test",
  sourceScenarioId: MUTATION_SCENARIO_ID,
  sourceChoiceId: MUTATION_CHOICE_ID,
  visibility: "developer_only",
  justification: "Neutral contract fixture.",
  magnitudeClassification: "unclassified",
  applicableConditionIds: [],
} as const;

function expectEffectRejectedBySchemaAndRegistry(effect: unknown): void {
  expect(effectSchema.safeParse(effect).success).toBe(false);
  expect(() =>
    mutationRegistry({
      choiceOverrides: { baseEffects: [EFFECT_BASE.id] },
      effects: [effect],
    }),
  ).toThrow();
}

describe("TASK-08 executable effect contract correction", () => {
  it.each(RELATIONSHIP_SCORE_FIELDS)(
    "accepts typed relationship field %s",
    (field) => {
      expect(
        effectSchema.safeParse({
          ...EFFECT_BASE,
          type: "relationship_score_adjustment",
          characterId: "mara_edevane",
          field,
          operation: "adjust",
          value: 1,
          unit: "normalized_score",
        }).success,
      ).toBe(true);
    },
  );

  it.each(FACTION_SCORE_FIELDS)("accepts typed faction field %s", (field) => {
    expect(
      effectSchema.safeParse({
        ...EFFECT_BASE,
        type: "faction_score_adjustment",
        factionId: "civic_renewal_league",
        field,
        operation: "adjust",
        value: -1,
        unit: "normalized_score",
      }).success,
    ).toBe(true);
  });

  it.each(REGION_SCORE_FIELDS)("accepts typed region field %s", (field) => {
    expect(
      effectSchema.safeParse({
        ...EFFECT_BASE,
        type: "region_score_adjustment",
        regionId: "orsanne_metropolitan_district",
        field,
        operation: "adjust",
        value: 1,
        unit: "normalized_score",
      }).success,
    ).toBe(true);
  });

  it.each(
    NORMALIZED_STATE_FIELDS.filter((field) => field.startsWith("family.")),
  )("retains typed family target %s", (targetField) => {
    expect(
      effectSchema.safeParse(
        normalizedEffect({ targetDomain: "family", targetField }),
      ).success,
    ).toBe(true);
  });

  it("accepts typed faction-region, region-basis-point, memory, and project effects", () => {
    for (const effect of [
      {
        ...EFFECT_BASE,
        type: "faction_regional_influence_adjustment",
        factionId: "civic_renewal_league",
        regionId: "orsanne_metropolitan_district",
        operation: "adjust",
        value: 1,
        unit: "normalized_score",
      },
      {
        ...EFFECT_BASE,
        type: "region_basis_point_adjustment",
        regionId: "orsanne_metropolitan_district",
        field: "unemploymentBps",
        operation: "adjust",
        value: 25,
        unit: "basis_points",
      },
      {
        ...EFFECT_BASE,
        type: "memory_weight_adjustment",
        memoryId: "memory_contract_test",
        field: "politicalWeight",
        operation: "adjust",
        value: -5,
        unit: "signed_weight",
      },
      {
        ...EFFECT_BASE,
        type: "region_project_membership",
        regionId: "orsanne_metropolitan_district",
        projectId: "project_contract_test",
        operation: "add",
        unit: "reference",
      },
    ]) {
      expect(effectSchema.safeParse(effect).success).toBe(true);
    }
  });

  it.each([
    "update_relationship",
    "update_faction",
    "update_region",
    "update_family",
    "update_intelligence_assertion",
    "create_or_update_project",
  ])("rejects ambiguous generic effect %s", (type) => {
    expectEffectRejectedBySchemaAndRegistry({
      ...EFFECT_BASE,
      type,
      targetDomain: "relationship",
      targetReference: "mara_edevane",
      operation: "update",
      value: "mara_edevane",
      unit: "reference",
    });
  });

  it("rejects ambiguous region basis points and immutable media sentiment mutation", () => {
    expectEffectRejectedBySchemaAndRegistry({
      ...EFFECT_BASE,
      type: "basis_point_adjustment",
      targetDomain: "region",
      targetField: "regions.unemploymentBps",
      operation: "adjust",
      value: 25,
      unit: "basis_points",
    });
    expectEffectRejectedBySchemaAndRegistry({
      ...EFFECT_BASE,
      type: "signed_weight_adjustment",
      targetDomain: "media",
      targetField: "media.sentiment",
      operation: "adjust",
      value: 1,
      unit: "signed_weight",
    });
  });

  it("rejects wrong units, unknown fields, and unknown canonical entities", () => {
    expectEffectRejectedBySchemaAndRegistry({
      ...EFFECT_BASE,
      type: "relationship_score_adjustment",
      characterId: "mara_edevane",
      field: "trust",
      operation: "adjust",
      value: 1,
      unit: "basis_points",
    });
    expectEffectRejectedBySchemaAndRegistry({
      ...EFFECT_BASE,
      type: "faction_score_adjustment",
      factionId: "civic_renewal_league",
      field: "unknownField",
      operation: "adjust",
      value: 1,
      unit: "normalized_score",
    });
    expectEffectRejectedBySchemaAndRegistry({
      ...EFFECT_BASE,
      type: "region_score_adjustment",
      regionId: "unknown_region",
      field: "approval",
      operation: "adjust",
      value: 1,
      unit: "normalized_score",
    });
  });

  it("rejects direct choice at-period conditionals", () => {
    expect(CONDITIONAL_EFFECT_TIMINGS).not.toContain("at_period_advancement");
    expect(
      choiceSchema.safeParse(
        mutationChoice({
          conditionalEffects: [
            {
              effectId: "effect_contract_test",
              requiredConditionIds: [],
              excludedConditionIds: [],
              evaluationTiming: "at_period_advancement",
              stackingRule: "reject_duplicate",
              developerExplanation: "Obsolete direct deferral.",
            },
          ],
        }),
      ).success,
    ).toBe(false);
    expect(() =>
      mutationRegistry({
        choiceOverrides: {
          conditionalEffects: [
            {
              effectId: "effect_contract_test",
              requiredConditionIds: [],
              excludedConditionIds: [],
              evaluationTiming: "at_period_advancement",
              stackingRule: "reject_duplicate",
              developerExplanation: "Obsolete direct deferral.",
            },
          ],
        },
        effects: [normalizedEffect({ id: "effect_contract_test" })],
      }),
    ).toThrow();
  });

  it("rejects an unregistered project at registry validation", () => {
    const effect = regionProjectMembershipEffect(
      "effect_project_missing",
      "add",
      {
        projectId: "project_missing",
      },
    );
    expect(() =>
      mutationRegistry({
        choiceOverrides: { baseEffects: [effect.id] },
        effects: [effect],
        projects: [mutationProject()],
      }),
    ).toThrow(/Missing projects reference project_missing/);
  });
});
