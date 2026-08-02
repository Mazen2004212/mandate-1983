import { describe, expect, it } from "vitest";

import {
  CANONICAL_CHARACTER_IDS,
  CANONICAL_FACTION_IDS,
  CANONICAL_INTERNATIONAL_ENTITY_IDS,
  CANONICAL_OUTCOME_IDS,
  CANONICAL_REGION_IDS,
  CHARACTER_AVAILABILITIES,
  CONTENT_LIFECYCLE_STATUSES,
  DELAYED_EFFECT_STATUSES,
  FAMILY_ROLE_IDS,
  POLITICAL_BACKGROUND_IDS,
  RESERVED_UNSUPPORTED_DIFFICULTIES,
  STATE_VISIBILITIES,
  authoredIdSchema,
  canonicalCharacterIdSchema,
  canonicalFactionIdSchema,
  canonicalInternationalEntityIdSchema,
  canonicalOutcomeIdSchema,
  canonicalRegionIdSchema,
  characterAvailabilitySchema,
  choiceIdSchema,
  contentLifecycleStatusSchema,
  delayedEffectStatusSchema,
  difficultySchema,
  effectIdSchema,
  familyRoleIdSchema,
  politicalBackgroundIdSchema,
  saveIdSchema,
  scenarioIdSchema,
  stateVisibilitySchema,
  userIdSchema,
} from "./index";

describe("stable identifiers", () => {
  it.each(["scenario_supply_01", "a", "choice_2"])(
    "accepts valid authored ID %s",
    (value) => {
      expect(authoredIdSchema.safeParse(value).success).toBe(true);
    },
  );

  it.each([
    "Scenario_supply",
    "1_scenario",
    "scenario-supply",
    "scenario supply",
    "scenario__supply",
    "scenario_",
    "épisode_one",
    "",
  ])("rejects invalid authored ID %s", (value) => {
    expect(authoredIdSchema.safeParse(value).success).toBe(false);
  });

  it("keeps authored namespaces independently branded at their boundaries", () => {
    expect(scenarioIdSchema.safeParse("scenario_supply_01").success).toBe(true);
    expect(choiceIdSchema.safeParse("choice_imports").success).toBe(true);
    expect(effectIdSchema.safeParse("effect_supply_relief").success).toBe(true);
  });

  it("uses UUID boundaries for future save ownership identifiers", () => {
    const id = "4cc946fc-22a0-4db1-991f-cf3d93bc11c7";
    expect(saveIdSchema.safeParse(id).success).toBe(true);
    expect(userIdSchema.safeParse(id).success).toBe(true);
    expect(saveIdSchema.safeParse("save_one").success).toBe(false);
  });

  it("accepts every canonical entity and rejects aliases", () => {
    for (const id of CANONICAL_CHARACTER_IDS) {
      expect(canonicalCharacterIdSchema.safeParse(id).success).toBe(true);
    }
    for (const id of CANONICAL_FACTION_IDS) {
      expect(canonicalFactionIdSchema.safeParse(id).success).toBe(true);
    }
    for (const id of CANONICAL_REGION_IDS) {
      expect(canonicalRegionIdSchema.safeParse(id).success).toBe(true);
    }
    for (const id of CANONICAL_INTERNATIONAL_ENTITY_IDS) {
      expect(canonicalInternationalEntityIdSchema.safeParse(id).success).toBe(
        true,
      );
    }
    for (const id of CANONICAL_OUTCOME_IDS) {
      expect(canonicalOutcomeIdSchema.safeParse(id).success).toBe(true);
    }
    for (const id of FAMILY_ROLE_IDS) {
      expect(familyRoleIdSchema.safeParse(id).success).toBe(true);
    }
    expect(
      canonicalCharacterIdSchema.safeParse("the_prime_minister").success,
    ).toBe(false);
  });
});

describe("closed classifications", () => {
  it("implements every exact documented enum", () => {
    for (const value of STATE_VISIBILITIES) {
      expect(stateVisibilitySchema.safeParse(value).success).toBe(true);
    }
    for (const value of POLITICAL_BACKGROUND_IDS) {
      expect(politicalBackgroundIdSchema.safeParse(value).success).toBe(true);
    }
    for (const value of CONTENT_LIFECYCLE_STATUSES) {
      expect(contentLifecycleStatusSchema.safeParse(value).success).toBe(true);
    }
    for (const value of DELAYED_EFFECT_STATUSES) {
      expect(delayedEffectStatusSchema.safeParse(value).success).toBe(true);
    }
    for (const value of CHARACTER_AVAILABILITIES) {
      expect(characterAvailabilitySchema.safeParse(value).success).toBe(true);
    }
  });

  it("supports only standard difficulty while retaining future labels as metadata", () => {
    expect(difficultySchema.safeParse("standard").success).toBe(true);
    for (const value of RESERVED_UNSUPPORTED_DIFFICULTIES) {
      expect(difficultySchema.safeParse(value).success).toBe(false);
    }
  });

  it.each(["private", "final", "complete", "available"])(
    "rejects undocumented classification %s",
    (value) => {
      expect(stateVisibilitySchema.safeParse(value).success).toBe(false);
      expect(contentLifecycleStatusSchema.safeParse(value).success).toBe(false);
      expect(delayedEffectStatusSchema.safeParse(value).success).toBe(false);
      expect(characterAvailabilitySchema.safeParse(value).success).toBe(false);
    },
  );
});
