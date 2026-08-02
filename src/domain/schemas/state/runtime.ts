import { z } from "zod";

import {
  canonicalCharacterIdSchema,
  canonicalOutcomeIdSchema,
  choiceIdSchema,
  conditionIdSchema,
  delayedEffectIdSchema,
  effectIdSchema,
  flagIdSchema,
  lawOrMeasureIdSchema,
  mediaIdSchema,
  memoryIdSchema,
  scenarioIdSchema,
} from "../../ids/identifier-schemas";
import {
  characterAvailabilitySchema,
  delayedEffectStatusSchema,
} from "../common/classifications";
import { politicalPeriodSchema } from "../common/numeric";
import { utcTimestampSchema } from "../common/timestamp";

export const characterRuntimeStateSchema = z
  .object({
    availability: characterAvailabilitySchema,
    memoryIds: z.array(memoryIdSchema),
  })
  .strict();

export const charactersStateSchema = z
  .object({
    mara_edevane: characterRuntimeStateSchema,
    lucien_kest: characterRuntimeStateSchema,
    sabine_orrel: characterRuntimeStateSchema,
    darek_voln: characterRuntimeStateSchema,
    ilona_meret: characterRuntimeStateSchema,
    tomas_veyr: characterRuntimeStateSchema,
    celia_rovan: characterRuntimeStateSchema,
    ansel_mire: characterRuntimeStateSchema,
  })
  .strict();

export const resolvedChoiceHistoryEntrySchema = z
  .object({
    scenarioId: scenarioIdSchema,
    choiceId: choiceIdSchema,
    politicalPeriod: politicalPeriodSchema,
    resolvedAt: utcTimestampSchema,
  })
  .strict();

export const idempotencyKeySchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9_-]+$/)
  .brand<"IdempotencyKey">();

export const delayedEffectRuntimeStateSchema = z
  .object({
    id: delayedEffectIdSchema,
    sourceScenarioId: scenarioIdSchema,
    sourceChoiceId: choiceIdSchema,
    creationPeriod: politicalPeriodSchema,
    triggerPeriod: politicalPeriodSchema,
    priority: z.number().int().safe(),
    effectIds: z.array(effectIdSchema),
    prerequisiteConditionIds: z.array(conditionIdSchema),
    cancellationConditionIds: z.array(conditionIdSchema),
    idempotencyKey: idempotencyKeySchema,
    status: delayedEffectStatusSchema,
  })
  .strict()
  .refine((effect) => effect.triggerPeriod >= effect.creationPeriod, {
    path: ["triggerPeriod"],
    message: "A delayed effect cannot trigger before it is created.",
  });

export const outcomeStateSchema = z
  .object({
    selectedOutcomeId: canonicalOutcomeIdSchema.optional(),
    resolvedAtPeriod: politicalPeriodSchema.optional(),
  })
  .strict()
  .superRefine((outcome, context) => {
    const hasOutcome = outcome.selectedOutcomeId !== undefined;
    const hasPeriod = outcome.resolvedAtPeriod !== undefined;
    if (hasOutcome !== hasPeriod) {
      context.addIssue({
        code: "custom",
        message:
          "Outcome selection and its resolution period must be present together.",
      });
    }
  });

export const cabinetStateSchema = z.array(canonicalCharacterIdSchema);
export const lawsAndMeasuresStateSchema = z.array(lawOrMeasureIdSchema);
export const flagsStateSchema = z.array(flagIdSchema);
export const eventHistoryStateSchema = z.array(
  resolvedChoiceHistoryEntrySchema,
);
export const pendingEventsStateSchema = z.array(scenarioIdSchema);
export const delayedEffectsStateSchema = z.array(
  delayedEffectRuntimeStateSchema,
);
export const mediaStateSchema = z.array(mediaIdSchema);

export type CharacterRuntimeState = z.infer<typeof characterRuntimeStateSchema>;
export type CharactersState = z.infer<typeof charactersStateSchema>;
export type ResolvedChoiceHistoryEntry = z.infer<
  typeof resolvedChoiceHistoryEntrySchema
>;
export type DelayedEffectRuntimeState = z.infer<
  typeof delayedEffectRuntimeStateSchema
>;
export type OutcomeState = z.infer<typeof outcomeStateSchema>;
