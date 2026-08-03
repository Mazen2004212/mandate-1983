import { z } from "zod";

import {
  basisPointsSchema,
  characterAvailabilitySchema,
  signedWeightSchema,
  stateVisibilitySchema,
} from "../../domain";
import {
  BASIS_POINT_STATE_FIELDS,
  CONDITIONAL_EFFECT_TIMINGS,
  MONEY_STATE_FIELDS,
  NORMALIZED_STATE_FIELDS,
} from "../constants";
import {
  choiceContentIdSchema,
  conditionContentIdSchema,
  contentObjectIdSchema,
  delayedEffectContentIdSchema,
  effectContentIdSchema,
  mediaContentIdSchema,
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
    value: z.number().int().min(-100).max(100),
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

export const signedWeightEffectSchema = z
  .object({
    ...effectBase,
    type: z.literal("signed_weight_adjustment"),
    targetDomain: z.enum(["memory", "media"]),
    targetField: z.enum([
      "memory.emotionalWeight",
      "memory.politicalWeight",
      "media.sentiment",
    ]),
    operation: z.literal("adjust"),
    value: signedWeightSchema,
    unit: z.literal("signed_weight"),
  })
  .strict()
  .refine(
    (effect) => effect.targetField.startsWith(`${effect.targetDomain}.`),
    {
      path: ["targetField"],
      message: "Signed-weight field must belong to its target domain.",
    },
  );

export const basisPointEffectSchema = z
  .object({
    ...effectBase,
    type: z.literal("basis_point_adjustment"),
    targetDomain: z.enum(["economy", "region"]),
    targetField: z.enum(BASIS_POINT_STATE_FIELDS),
    operation: z.literal("adjust"),
    value: basisPointsSchema,
    unit: z.literal("basis_points"),
  })
  .strict()
  .refine(
    (effect) =>
      effect.targetDomain === "economy"
        ? effect.targetField.startsWith("economy.")
        : effect.targetField.startsWith("regions."),
    {
      path: ["targetField"],
      message: "Basis-point field must belong to its target domain.",
    },
  );

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
    type: z.enum([
      "set_flag",
      "remove_flag",
      "create_memory",
      "update_relationship",
      "update_faction",
      "update_region",
      "update_family",
      "update_intelligence_assertion",
      "create_or_update_law",
      "create_or_update_measure",
      "create_or_update_project",
    ]),
    targetDomain: z.enum([
      "flag",
      "memory",
      "relationship",
      "faction",
      "region",
      "family",
      "intelligence",
      "law_or_measure",
      "project",
    ]),
    targetReference: contentObjectIdSchema,
    operation: z.enum(["set", "remove", "create", "update"]),
    value: z.union([contentObjectIdSchema, boundedText(1, 200)]),
    unit: z.literal("reference"),
  })
  .strict()
  .superRefine((effect, context) => {
    const contracts = {
      set_flag: ["flag", "set"],
      remove_flag: ["flag", "remove"],
      create_memory: ["memory", "create"],
      update_relationship: ["relationship", "update"],
      update_faction: ["faction", "update"],
      update_region: ["region", "update"],
      update_family: ["family", "update"],
      update_intelligence_assertion: ["intelligence", "update"],
      create_or_update_law: ["law_or_measure", "update"],
      create_or_update_measure: ["law_or_measure", "update"],
      create_or_update_project: ["project", "update"],
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

export const characterAvailabilityEffectSchema = z
  .object({
    ...effectBase,
    type: z.literal("update_character_availability"),
    targetDomain: z.literal("character"),
    targetReference: contentObjectIdSchema,
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
  signedWeightEffectSchema,
  basisPointEffectSchema,
  moneyEffectSchema,
  referenceEffectSchema,
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
