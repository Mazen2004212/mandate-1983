import { describe, expect, it } from "vitest";

import * as contentContracts from ".";
import {
  BASIS_POINT_STATE_FIELDS,
  FACTION_SCORE_FIELDS,
  REGION_SCORE_FIELDS,
  RELATIONSHIP_SCORE_FIELDS,
  buildContentRegistry,
  conditionSchema,
  factionRegionalInfluenceConditionSchema,
  factionScoreConditionSchema,
  politicalPeriodConditionSchema,
  regionBasisPointsConditionSchema,
  regionScoreConditionSchema,
  relationshipScoreConditionSchema,
} from ".";
import { CANONICAL_FACTION_IDS, CANONICAL_REGION_IDS } from "../domain";

const conditionBase = {
  visibility: "developer_only",
  developerFailureExplanation: "Neutral test-only failure detail.",
} as const;

function emptyRegistry(conditions: readonly unknown[]) {
  return {
    scenarios: [],
    choices: [],
    conditions,
    effects: [],
    delayedEffects: [],
    memories: [],
    flags: [],
    characters: [],
    factions: [],
    regions: [],
    institutions: [],
    backgrounds: [],
    lawsAndMeasures: [],
    projects: [],
    intelligenceAssertions: [],
    mediaReactions: [],
    outcomes: [],
    epilogues: [],
  };
}

describe("political-period condition contract", () => {
  const valid = {
    ...conditionBase,
    id: "condition_period_fixture",
    type: "political_period",
    operator: "equals",
    unit: "political_period",
    expectedValue: 1,
  };

  it("accepts equality, numeric comparison, and valid ranges", () => {
    expect(politicalPeriodConditionSchema.safeParse(valid).success).toBe(true);
    expect(
      politicalPeriodConditionSchema.safeParse({
        ...valid,
        operator: "greater_than_or_equal",
      }).success,
    ).toBe(true);
    expect(
      politicalPeriodConditionSchema.safeParse({
        ...valid,
        operator: "within_range",
        expectedValue: undefined,
        range: { minimum: 0, maximum: 6 },
      }).success,
    ).toBe(true);
  });

  it("rejects invalid periods, reversed ranges, wrong units, and unsupported operators", () => {
    expect(
      politicalPeriodConditionSchema.safeParse({ ...valid, expectedValue: -1 })
        .success,
    ).toBe(false);
    expect(
      politicalPeriodConditionSchema.safeParse({
        ...valid,
        operator: "within_range",
        expectedValue: undefined,
        range: { minimum: 6, maximum: 1 },
      }).success,
    ).toBe(false);
    expect(
      politicalPeriodConditionSchema.safeParse({
        ...valid,
        unit: "normalized_score",
      }).success,
    ).toBe(false);
    expect(
      politicalPeriodConditionSchema.safeParse({
        ...valid,
        operator: "contains",
      }).success,
    ).toBe(false);
  });
});

describe("relationship-score condition contract", () => {
  const valid = {
    ...conditionBase,
    id: "condition_relationship_fixture",
    type: "relationship_score",
    characterId: "mara_edevane",
    field: "trust",
    operator: "greater_than",
    unit: "normalized_score",
    expectedValue: 50,
  };

  it("accepts every supported relationship field and a canonical character", () => {
    for (const field of RELATIONSHIP_SCORE_FIELDS) {
      expect(
        relationshipScoreConditionSchema.safeParse({ ...valid, field }).success,
      ).toBe(true);
    }
  });

  it("rejects unknown characters, fields, units, values, and reversed ranges", () => {
    expect(
      relationshipScoreConditionSchema.safeParse({
        ...valid,
        characterId: "unknown_character",
      }).success,
    ).toBe(false);
    expect(
      relationshipScoreConditionSchema.safeParse({
        ...valid,
        field: "loyalty",
      }).success,
    ).toBe(false);
    expect(
      relationshipScoreConditionSchema.safeParse({
        ...valid,
        unit: "basis_points",
      }).success,
    ).toBe(false);
    expect(
      relationshipScoreConditionSchema.safeParse({
        ...valid,
        expectedValue: 101,
      }).success,
    ).toBe(false);
    expect(
      relationshipScoreConditionSchema.safeParse({
        ...valid,
        operator: "within_range",
        expectedValue: undefined,
        range: { minimum: 80, maximum: 20 },
      }).success,
    ).toBe(false);
  });
});

describe("faction condition contracts", () => {
  const score = {
    ...conditionBase,
    id: "condition_faction_fixture",
    type: "faction_score",
    factionId: "civic_renewal_league",
    field: "support",
    operator: "greater_than_or_equal",
    unit: "normalized_score",
    expectedValue: 40,
  };

  it("accepts every supported faction field and canonical faction", () => {
    for (const field of FACTION_SCORE_FIELDS) {
      expect(
        factionScoreConditionSchema.safeParse({ ...score, field }).success,
      ).toBe(true);
    }
  });

  it("rejects unknown factions, fields, and reversed ranges", () => {
    expect(
      factionScoreConditionSchema.safeParse({
        ...score,
        factionId: "unknown_faction",
      }).success,
    ).toBe(false);
    expect(
      factionScoreConditionSchema.safeParse({ ...score, field: "approval" })
        .success,
    ).toBe(false);
    expect(
      factionScoreConditionSchema.safeParse({
        ...score,
        operator: "within_range",
        expectedValue: undefined,
        range: { minimum: 60, maximum: 20 },
      }).success,
    ).toBe(false);
  });

  it("requires canonical faction and region IDs for regional influence", () => {
    const influence = {
      ...conditionBase,
      id: "condition_faction_region_fixture",
      type: "faction_regional_influence",
      factionId: "workers_commonwealth",
      regionId: "kestrel_industrial_basin",
      operator: "equals",
      unit: "normalized_score",
      expectedValue: 50,
    };
    expect(
      factionRegionalInfluenceConditionSchema.safeParse(influence).success,
    ).toBe(true);
    expect(
      factionRegionalInfluenceConditionSchema.safeParse({
        ...influence,
        factionId: "unknown_faction",
      }).success,
    ).toBe(false);
    expect(
      factionRegionalInfluenceConditionSchema.safeParse({
        ...influence,
        regionId: "unknown_region",
      }).success,
    ).toBe(false);
    expect(
      factionRegionalInfluenceConditionSchema.safeParse({
        ...influence,
        expectedValue: -1,
      }).success,
    ).toBe(false);
  });
});

describe("regional condition contracts", () => {
  const score = {
    ...conditionBase,
    id: "condition_region_fixture",
    type: "region_score",
    regionId: "orsanne_metropolitan_district",
    field: "approval",
    operator: "less_than",
    unit: "normalized_score",
    expectedValue: 60,
  };

  it("accepts every normalized field and every canonical region", () => {
    for (const field of REGION_SCORE_FIELDS) {
      expect(
        regionScoreConditionSchema.safeParse({ ...score, field }).success,
      ).toBe(true);
    }
    for (const regionId of CANONICAL_REGION_IDS) {
      expect(
        regionScoreConditionSchema.safeParse({ ...score, regionId }).success,
      ).toBe(true);
    }
  });

  it("rejects unknown regions, invalid fields, and wrong units", () => {
    expect(
      regionScoreConditionSchema.safeParse({
        ...score,
        regionId: "unknown_region",
      }).success,
    ).toBe(false);
    expect(
      regionScoreConditionSchema.safeParse({
        ...score,
        field: "unemploymentBps",
      }).success,
    ).toBe(false);
    expect(
      regionScoreConditionSchema.safeParse({ ...score, unit: "basis_points" })
        .success,
    ).toBe(false);
  });

  it("validates exact-region unemployment basis points", () => {
    const unemployment = {
      ...conditionBase,
      id: "condition_region_unemployment_fixture",
      type: "region_basis_points",
      regionId: "roven_marches",
      field: "unemploymentBps",
      operator: "within_range",
      unit: "basis_points",
      range: { minimum: 0, maximum: 4_000 },
    };
    expect(
      regionBasisPointsConditionSchema.safeParse(unemployment).success,
    ).toBe(true);
    expect(
      regionBasisPointsConditionSchema.safeParse({
        ...unemployment,
        regionId: undefined,
      }).success,
    ).toBe(false);
    expect(
      regionBasisPointsConditionSchema.safeParse({
        ...unemployment,
        regionId: "unknown_region",
      }).success,
    ).toBe(false);
    expect(
      regionBasisPointsConditionSchema.safeParse({
        ...unemployment,
        range: undefined,
        operator: "equals",
        expectedValue: 1.5,
      }).success,
    ).toBe(false);
    expect(
      regionBasisPointsConditionSchema.safeParse({
        ...unemployment,
        range: { minimum: 5_000, maximum: 1_000 },
      }).success,
    ).toBe(false);
    expect(BASIS_POINT_STATE_FIELDS).not.toContain("regions.unemploymentBps");
  });
});

describe("condition amendment regression", () => {
  const variants = [
    {
      ...conditionBase,
      id: "condition_registry_period",
      type: "political_period",
      operator: "equals",
      unit: "political_period",
      expectedValue: 1,
    },
    {
      ...conditionBase,
      id: "condition_registry_relationship",
      type: "relationship_score",
      characterId: "mara_edevane",
      field: "respect",
      operator: "equals",
      unit: "normalized_score",
      expectedValue: 50,
    },
    {
      ...conditionBase,
      id: "condition_registry_faction",
      type: "faction_score",
      factionId: CANONICAL_FACTION_IDS[0],
      field: "unity",
      operator: "equals",
      unit: "normalized_score",
      expectedValue: 50,
    },
    {
      ...conditionBase,
      id: "condition_registry_influence",
      type: "faction_regional_influence",
      factionId: CANONICAL_FACTION_IDS[1],
      regionId: CANONICAL_REGION_IDS[0],
      operator: "equals",
      unit: "normalized_score",
      expectedValue: 0,
    },
    {
      ...conditionBase,
      id: "condition_registry_region",
      type: "region_score",
      regionId: CANONICAL_REGION_IDS[1],
      field: "securityTension",
      operator: "equals",
      unit: "normalized_score",
      expectedValue: 50,
    },
    {
      ...conditionBase,
      id: "condition_registry_region_bps",
      type: "region_basis_points",
      regionId: CANONICAL_REGION_IDS[2],
      field: "unemploymentBps",
      operator: "equals",
      unit: "basis_points",
      expectedValue: 500,
    },
  ];

  it("keeps strict union and registry support for all new variants", () => {
    variants.forEach((condition) =>
      expect(conditionSchema.safeParse(condition).success).toBe(true),
    );
    expect(buildContentRegistry(emptyRegistry(variants)).success).toBe(true);
  });

  it("rejects unknown types and properties without adding evaluation", () => {
    expect(
      conditionSchema.safeParse({ ...variants[0], type: "entity_score" })
        .success,
    ).toBe(false);
    expect(
      conditionSchema.safeParse({ ...variants[0], callback: () => true })
        .success,
    ).toBe(false);
    expect("evaluateCondition" in contentContracts).toBe(false);
  });

  it("returns precise registry paths for invalid variants", () => {
    const result = buildContentRegistry(
      emptyRegistry([{ ...variants[4], regionId: "unknown_region" }]),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues[0]?.code).toBe("schema_invalid");
      expect(result.issues[0]?.path).toContain("regionId");
    }
  });
});
