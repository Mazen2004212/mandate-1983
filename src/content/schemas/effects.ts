import { z } from "zod";

import {
  basisPointsSchema,
  canonicalCharacterIdSchema,
  canonicalFactionIdSchema,
  canonicalRegionIdSchema,
  characterAvailabilitySchema,
  signedWeightSchema,
  stateVisibilitySchema,
} from "../../domain";
import {
  BASIS_POINT_STATE_FIELDS,
  CONDITIONAL_EFFECT_TIMINGS,
  FACTION_SCORE_FIELDS,
  MONEY_STATE_FIELDS,
  NORMALIZED_STATE_FIELDS,
  REGION_SCORE_FIELDS,
  RELATIONSHIP_SCORE_FIELDS,
} from "../constants";
import {
  choiceContentIdSchema,
  conditionContentIdSchema,
  contentObjectIdSchema,
  delayedEffectContentIdSchema,
  effectContentIdSchema,
  lawOrMeasureContentIdSchema,
  mediaContentIdSchema,
  memoryContentIdSchema,
  projectContentIdSchema,
  scenarioContentIdSchema,
} from "../ids";
import { boundedText, contentMoneyMinorSchema } from "./common";

const effectBase = {
  id: effectContentIdSchema,
  sourceScenarioId: scenarioContentIdSchema,
  sourceChoiceId: choiceContentIdSchema,
  visibility: stateVisibilitySchema,
  justification: boundedText(1, 400),
  magnitudeClassification: z.literal("unclassified"),
  applicableConditionIds: z.array(conditionContentIdSchema),
} as const;

const normalizedDeltaSchema = z.number().int().min(-100).max(100);

export const normalizedScoreEffectSchema = z
  .object({
    ...effectBase,
    type: z.literal("normalized_score_adjustment"),
    targetDomain: z.enum([
      "economy",
      "government",
      "security",
      "international",
      "family",
    ]),
    targetField: z.enum(NORMALIZED_STATE_FIELDS),
    operation: z.literal("adjust"),
    value: normalizedDeltaSchema,
    unit: z.literal("normalized_score"),
  })
  .strict()
  .refine(
    (effect) => effect.targetField.startsWith(`${effect.targetDomain}.`),
    {
      path: ["targetField"],
      message: "Normalized-score field must belong to its target domain.",
    },
  );

export const relationshipScoreEffectSchema = z
  .object({
    ...effectBase,
    type: z.literal("relationship_score_adjustment"),
    characterId: canonicalCharacterIdSchema,
    field: z.enum(RELATIONSHIP_SCORE_FIELDS),
    operation: z.literal("adjust"),
    value: normalizedDeltaSchema,
    unit: z.literal("normalized_score"),
  })
  .strict();

export const factionScoreEffectSchema = z
  .object({
    ...effectBase,
    type: z.literal("faction_score_adjustment"),
    factionId: canonicalFactionIdSchema,
    field: z.enum(FACTION_SCORE_FIELDS),
    operation: z.literal("adjust"),
    value: normalizedDeltaSchema,
    unit: z.literal("normalized_score"),
  })
  .strict();

export const factionRegionalInfluenceEffectSchema = z
  .object({
    ...effectBase,
    type: z.literal("faction_regional_influence_adjustment"),
    factionId: canonicalFactionIdSchema,
    regionId: canonicalRegionIdSchema,
    operation: z.literal("adjust"),
    value: normalizedDeltaSchema,
    unit: z.literal("normalized_score"),
  })
  .strict();

export const regionScoreEffectSchema = z
  .object({
    ...effectBase,
    type: z.literal("region_score_adjustment"),
    regionId: canonicalRegionIdSchema,
    field: z.enum(REGION_SCORE_FIELDS),
    operation: z.literal("adjust"),
    value: normalizedDeltaSchema,
    unit: z.literal("normalized_score"),
  })
  .strict();

export const memoryWeightEffectSchema = z
  .object({
    ...effectBase,
    type: z.literal("memory_weight_adjustment"),
    memoryId: memoryContentIdSchema,
    field: z.enum(["emotionalWeight", "politicalWeight"]),
    operation: z.literal("adjust"),
    value: signedWeightSchema,
    unit: z.literal("signed_weight"),
  })
  .strict();

export const basisPointEffectSchema = z
  .object({
    ...effectBase,
    type: z.literal("basis_point_adjustment"),
    targetDomain: z.literal("economy"),
    targetField: z.enum(BASIS_POINT_STATE_FIELDS),
    operation: z.literal("adjust"),
    value: basisPointsSchema,
    unit: z.literal("basis_points"),
  })
  .strict();

export const regionBasisPointEffectSchema = z
  .object({
    ...effectBase,
    type: z.literal("region_basis_point_adjustment"),
    regionId: canonicalRegionIdSchema,
    field: z.literal("unemploymentBps"),
    operation: z.literal("adjust"),
    value: basisPointsSchema,
    unit: z.literal("basis_points"),
  })
  .strict();

export const moneyEffectSchema = z
  .object({
    ...effectBase,
    type: z.literal("money_minor_adjustment"),
    targetDomain: z.literal("economy"),
    targetField: z.enum(MONEY_STATE_FIELDS),
    operation: z.literal("adjust"),
    value: contentMoneyMinorSchema,
    unit: z.literal("money_minor"),
  })
  .strict();

export const referenceEffectSchema = z
  .object({
    ...effectBase,
    type: z.enum(["set_flag", "remove_flag", "create_memory"]),
    targetDomain: z.enum(["flag", "memory"]),
    targetReference: contentObjectIdSchema,
    operation: z.enum(["set", "remove", "create"]),
    value: z.union([contentObjectIdSchema, boundedText(1, 200)]),
    unit: z.literal("reference"),
  })
  .strict()
  .superRefine((effect, context) => {
    const contracts = {
      set_flag: ["flag", "set"],
      remove_flag: ["flag", "remove"],
      create_memory: ["memory", "create"],
    } as const;
    const [domain, operation] = contracts[effect.type];
    if (effect.targetDomain !== domain || effect.operation !== operation) {
      context.addIssue({
        code: "custom",
        path: ["targetDomain"],
        message: `${effect.type} requires ${domain}/${operation}.`,
      });
    }
  });

export const lawOrMeasureMembershipEffectSchema = z
  .object({
    ...effectBase,
    type: z.literal("law_or_measure_membership"),
    lawOrMeasureId: lawOrMeasureContentIdSchema,
    operation: z.enum(["add", "remove"]),
    unit: z.literal("reference"),
  })
  .strict();

export const regionProjectMembershipEffectSchema = z
  .object({
    ...effectBase,
    type: z.literal("region_project_membership"),
    regionId: canonicalRegionIdSchema,
    projectId: projectContentIdSchema,
    operation: z.enum(["add", "remove"]),
    unit: z.literal("reference"),
  })
  .strict();

export const characterAvailabilityEffectSchema = z
  .object({
    ...effectBase,
    type: z.literal("update_character_availability"),
    targetDomain: z.literal("character"),
    targetReference: canonicalCharacterIdSchema,
    operation: z.literal("set"),
    value: characterAvailabilitySchema,
    unit: z.literal("availability"),
  })
  .strict();

export const schedulingEffectSchema = z
  .object({
    ...effectBase,
    type: z.enum([
      "schedule_delayed_effect",
      "schedule_media_reaction",
      "trigger_follow_up_eligibility",
    ]),
    targetDomain: z.enum(["delayed_effect", "media", "scenario"]),
    targetReference: z.union([
      delayedEffectContentIdSchema,
      mediaContentIdSchema,
      scenarioContentIdSchema,
    ]),
    operation: z.literal("schedule"),
    value: z.literal("referenced_definition"),
    unit: z.literal("reference"),
  })
  .strict()
  .refine(
    (effect) =>
      (effect.type === "schedule_delayed_effect" &&
        effect.targetDomain === "delayed_effect") ||
      (effect.type === "schedule_media_reaction" &&
        effect.targetDomain === "media") ||
      (effect.type === "trigger_follow_up_eligibility" &&
        effect.targetDomain === "scenario"),
    {
      path: ["targetDomain"],
      message: "Scheduling target domain must match its effect type.",
    },
  );

export const effectSchema = z.discriminatedUnion("type", [
  normalizedScoreEffectSchema,
  relationshipScoreEffectSchema,
  factionScoreEffectSchema,
  factionRegionalInfluenceEffectSchema,
  regionScoreEffectSchema,
  memoryWeightEffectSchema,
  basisPointEffectSchema,
  regionBasisPointEffectSchema,
  moneyEffectSchema,
  referenceEffectSchema,
  lawOrMeasureMembershipEffectSchema,
  regionProjectMembershipEffectSchema,
  characterAvailabilityEffectSchema,
  schedulingEffectSchema,
]);

export const conditionalEffectSchema = z
  .object({
    effectId: effectContentIdSchema,
    requiredConditionIds: z.array(conditionContentIdSchema),
    excludedConditionIds: z.array(conditionContentIdSchema),
    evaluationTiming: z.enum(CONDITIONAL_EFFECT_TIMINGS),
    stackingRule: z.enum(["stack", "replace", "reject_duplicate"]),
    developerExplanation: boundedText(1, 400),
  })
  .strict();

export type EffectDefinition = z.infer<typeof effectSchema>;
export type ConditionalEffectDefinition = z.infer<
  typeof conditionalEffectSchema
>;
