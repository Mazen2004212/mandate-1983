import { z } from "zod";

import {
  delayedEffectFailureBehaviorSchema,
  delayedEffectIdempotencyScopeSchema,
  delayedEffectStatusSchema,
  memoryActorIdSchema,
  politicalPeriodSchema,
  signedWeightSchema,
  stateVisibilitySchema,
} from "../../domain";
import {
  choiceContentIdSchema,
  conditionContentIdSchema,
  contentObjectIdSchema,
  delayedEffectContentIdSchema,
  effectContentIdSchema,
  flagContentIdSchema,
  memoryContentIdSchema,
  scenarioContentIdSchema,
} from "../ids";
import { boundedText } from "./common";

export const delayedEffectDefinitionSchema = z
  .object({
    id: delayedEffectContentIdSchema,
    sourceScenarioId: scenarioContentIdSchema,
    sourceChoiceId: choiceContentIdSchema,
    creationPeriod: politicalPeriodSchema,
    triggerPeriod: politicalPeriodSchema.optional(),
    relativeDelay: z.number().int().positive().optional(),
    priority: z.number().int().min(0).max(10_000),
    payload: z.array(effectContentIdSchema).min(1),
    prerequisites: z.array(conditionContentIdSchema),
    cancellationConditions: z.array(conditionContentIdSchema),
    expiryConditions: z.array(conditionContentIdSchema),
    idempotencyScope: delayedEffectIdempotencyScopeSchema,
    status: delayedEffectStatusSchema,
    failureBehavior: delayedEffectFailureBehaviorSchema,
    followUpContentIds: z.array(contentObjectIdSchema),
    developerExplanation: boundedText(1, 600),
  })
  .strict()
  .superRefine((definition, context) => {
    if (
      (definition.triggerPeriod === undefined) ===
      (definition.relativeDelay === undefined)
    ) {
      context.addIssue({
        code: "custom",
        path: ["triggerPeriod"],
        message: "Define exactly one of triggerPeriod or relativeDelay.",
      });
    }
    if (
      definition.triggerPeriod !== undefined &&
      definition.triggerPeriod < definition.creationPeriod
    ) {
      context.addIssue({
        code: "custom",
        path: ["triggerPeriod"],
        message: "Trigger period cannot precede creation period.",
      });
    }
  });

export const memoryDefinitionSchema = z
  .object({
    id: memoryContentIdSchema,
    subjectId: memoryActorIdSchema,
    targetId: memoryActorIdSchema,
    sourceScenarioId: scenarioContentIdSchema,
    sourceChoiceId: choiceContentIdSchema.optional(),
    emotionalWeight: signedWeightSchema,
    politicalWeight: signedWeightSchema,
    visibility: stateVisibilitySchema,
    creationPeriod: politicalPeriodSchema,
    decayRatePerPeriod: z.number().int().min(0).max(100),
    permanent: z.boolean(),
    dialogueInfluenceTags: z.array(boundedText(1, 40)),
    eventInfluenceTags: z.array(boundedText(1, 40)),
    outcomeInfluenceTags: z.array(boundedText(1, 40)),
    stackingRule: z.enum(["stack", "replace", "reject_duplicate"]),
    replacementRule: boundedText(1, 240).optional(),
    developerDescription: boundedText(1, 600),
  })
  .strict()
  .superRefine((memory, context) => {
    if (memory.permanent && memory.decayRatePerPeriod !== 0) {
      context.addIssue({
        code: "custom",
        path: ["decayRatePerPeriod"],
        message: "Permanent memories must have zero decay.",
      });
    }
    if (
      memory.stackingRule === "replace" &&
      memory.replacementRule === undefined
    ) {
      context.addIssue({
        code: "custom",
        path: ["replacementRule"],
        message: "Replacement stacking requires an explicit replacement rule.",
      });
    }
  });

const flagSourceSchema = z
  .object({
    scenarioId: scenarioContentIdSchema,
    choiceId: choiceContentIdSchema.optional(),
  })
  .strict();

export const flagDefinitionSchema = z
  .object({
    id: flagContentIdSchema,
    description: boundedText(1, 400),
    visibility: stateVisibilitySchema,
    creationSources: z.array(flagSourceSchema).min(1),
    removalSources: z.array(flagSourceSchema),
    permanence: z.boolean(),
    compatibilityNotes: z.array(boundedText(1, 400)),
  })
  .strict()
  .refine((flag) => !flag.permanence || flag.removalSources.length === 0, {
    path: ["removalSources"],
    message: "Permanent flags cannot define removal sources.",
  });

export type DelayedEffectDefinition = z.infer<
  typeof delayedEffectDefinitionSchema
>;
export type MemoryDefinition = z.infer<typeof memoryDefinitionSchema>;
export type FlagDefinition = z.infer<typeof flagDefinitionSchema>;
