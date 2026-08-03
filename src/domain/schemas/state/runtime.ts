import { z } from "zod";

import {
  authoredIdSchema,
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
  delayedEffectFailureBehaviorSchema,
  delayedEffectIdempotencyScopeSchema,
  delayedEffectStatusSchema,
} from "../common/classifications";
import { politicalPeriodSchema, revisionSchema } from "../common/numeric";
import { utcTimestampSchema } from "../common/timestamp";
import { contentVersionSchema } from "../common/versions";

function uniqueArray<T extends z.ZodType>(itemSchema: T) {
  return z.array(itemSchema).superRefine((items, context) => {
    const firstIndexByValue = new Map<string, number>();
    items.forEach((item, index) => {
      const key = String(item);
      const firstIndex = firstIndexByValue.get(key);
      if (firstIndex !== undefined) {
        context.addIssue({
          code: "custom",
          path: [index],
          message: `Duplicate ID ${key}; first occurrence is at index ${firstIndex}.`,
        });
      } else {
        firstIndexByValue.set(key, index);
      }
    });
  });
}

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

export const idempotencyKeySchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9_-]+$/)
  .brand<"IdempotencyKey">();

export const choiceResolutionHistoryEntrySchema = z
  .object({
    type: z.literal("choice_resolution"),
    idempotencyKey: idempotencyKeySchema,
    scenarioId: scenarioIdSchema,
    choiceId: choiceIdSchema,
    expectedRevision: revisionSchema,
    resultingRevision: revisionSchema,
    politicalPeriod: politicalPeriodSchema,
    resolvedAt: utcTimestampSchema,
    appliedEffectIds: uniqueArray(effectIdSchema),
    createdMemoryIds: uniqueArray(memoryIdSchema),
    addedFlagIds: uniqueArray(flagIdSchema),
    removedFlagIds: uniqueArray(flagIdSchema),
    scheduledDelayedEffectIds: uniqueArray(delayedEffectIdSchema),
    scheduledMediaIds: uniqueArray(mediaIdSchema),
  })
  .strict()
  .refine((entry) => entry.resultingRevision === entry.expectedRevision + 1, {
    path: ["resultingRevision"],
    message:
      "Resulting revision must be exactly one greater than expected revision.",
  });

export const periodAdvanceHistoryEntrySchema = z
  .object({
    type: z.literal("period_advance"),
    idempotencyKey: idempotencyKeySchema,
    expectedRevision: revisionSchema,
    resultingRevision: revisionSchema,
    fromPeriod: politicalPeriodSchema,
    toPeriod: politicalPeriodSchema,
    advancedAt: utcTimestampSchema,
    appliedEffectIds: uniqueArray(effectIdSchema),
    executedDelayedEffectIds: uniqueArray(delayedEffectIdSchema),
    cancelledDelayedEffectIds: uniqueArray(delayedEffectIdSchema),
    expiredDelayedEffectIds: uniqueArray(delayedEffectIdSchema),
    failedDelayedEffectIds: uniqueArray(delayedEffectIdSchema),
    scheduledMediaIds: uniqueArray(mediaIdSchema),
  })
  .strict()
  .superRefine((entry, context) => {
    if (entry.resultingRevision !== entry.expectedRevision + 1) {
      context.addIssue({
        code: "custom",
        path: ["resultingRevision"],
        message:
          "Resulting revision must be exactly one greater than expected revision.",
      });
    }
    if (entry.toPeriod !== entry.fromPeriod + 1) {
      context.addIssue({
        code: "custom",
        path: ["toPeriod"],
        message: "MVP period advancement must advance exactly one period.",
      });
    }
    const terminalGroups = [
      ["executedDelayedEffectIds", entry.executedDelayedEffectIds],
      ["cancelledDelayedEffectIds", entry.cancelledDelayedEffectIds],
      ["expiredDelayedEffectIds", entry.expiredDelayedEffectIds],
      ["failedDelayedEffectIds", entry.failedDelayedEffectIds],
    ] as const;
    const firstGroupById = new Map<string, string>();
    terminalGroups.forEach(([field, ids]) => {
      ids.forEach((id, index) => {
        const key = String(id);
        const firstGroup = firstGroupById.get(key);
        if (firstGroup !== undefined) {
          context.addIssue({
            code: "custom",
            path: [field, index],
            message: `Delayed effect ${key} already appears in ${firstGroup}.`,
          });
        } else {
          firstGroupById.set(key, field);
        }
      });
    });
  });

export const mutationHistoryEntrySchema = z.discriminatedUnion("type", [
  choiceResolutionHistoryEntrySchema,
  periodAdvanceHistoryEntrySchema,
]);

// Retained as an intentional compatibility name for TASK-07 consumers.
export const resolvedChoiceHistoryEntrySchema =
  choiceResolutionHistoryEntrySchema;

export const delayedEffectRuntimeStateSchema = z
  .object({
    id: delayedEffectIdSchema,
    definitionContentVersion: contentVersionSchema,
    sourceScenarioId: scenarioIdSchema,
    sourceChoiceId: choiceIdSchema,
    sourceMutationIdempotencyKey: idempotencyKeySchema,
    creationPeriod: politicalPeriodSchema,
    triggerPeriod: politicalPeriodSchema,
    priority: z.number().int().safe(),
    effectIds: uniqueArray(effectIdSchema),
    prerequisiteConditionIds: uniqueArray(conditionIdSchema),
    cancellationConditionIds: uniqueArray(conditionIdSchema),
    expiryConditionIds: uniqueArray(conditionIdSchema),
    idempotencyScope: delayedEffectIdempotencyScopeSchema,
    failureBehavior: delayedEffectFailureBehaviorSchema,
    followUpContentIds: uniqueArray(authoredIdSchema),
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
export const eventHistoryStateSchema = z
  .array(mutationHistoryEntrySchema)
  .superRefine((entries, context) => {
    const firstIndexByKey = new Map<string, number>();
    entries.forEach((entry, index) => {
      const key = String(entry.idempotencyKey);
      const firstIndex = firstIndexByKey.get(key);
      if (firstIndex !== undefined) {
        context.addIssue({
          code: "custom",
          path: [index, "idempotencyKey"],
          message: `Idempotency key ${key} already appears at event-history index ${firstIndex}.`,
        });
      } else {
        firstIndexByKey.set(key, index);
      }
    });
  });
export const pendingEventsStateSchema = z.array(scenarioIdSchema);
export const delayedEffectsStateSchema = z
  .array(delayedEffectRuntimeStateSchema)
  .superRefine((effects, context) => {
    effects.forEach((effect, index) => {
      for (let priorIndex = 0; priorIndex < index; priorIndex += 1) {
        const prior = effects[priorIndex];
        if (
          prior !== undefined &&
          delayedEffectInstancesCollide(prior, effect)
        ) {
          context.addIssue({
            code: "custom",
            path: [index, "id"],
            message: `Delayed-effect instance collides with index ${priorIndex} under its persisted idempotency scope.`,
          });
        }
      }
    });
  });
export const mediaStateSchema = z.array(mediaIdSchema);

export type CharacterRuntimeState = z.infer<typeof characterRuntimeStateSchema>;
export type CharactersState = z.infer<typeof charactersStateSchema>;
export type ChoiceResolutionHistoryEntry = z.infer<
  typeof choiceResolutionHistoryEntrySchema
>;
export type PeriodAdvanceHistoryEntry = z.infer<
  typeof periodAdvanceHistoryEntrySchema
>;
export type MutationHistoryEntry = z.infer<typeof mutationHistoryEntrySchema>;
export type ResolvedChoiceHistoryEntry = z.infer<
  typeof resolvedChoiceHistoryEntrySchema
>;
export type DelayedEffectRuntimeState = z.infer<
  typeof delayedEffectRuntimeStateSchema
>;
export type OutcomeState = z.infer<typeof outcomeStateSchema>;

export function delayedEffectRuntimeIdentityKey(
  effect: DelayedEffectRuntimeState,
): string {
  if (effect.idempotencyScope === "save") return String(effect.id);
  if (effect.idempotencyScope === "scenario") {
    return `${effect.id}:${effect.sourceScenarioId}`;
  }
  return `${effect.id}:${effect.sourceScenarioId}:${effect.sourceChoiceId}`;
}

export function delayedEffectInstancesCollide(
  left: DelayedEffectRuntimeState,
  right: DelayedEffectRuntimeState,
): boolean {
  if (left.id !== right.id) return false;
  if (left.idempotencyScope === "save" || right.idempotencyScope === "save") {
    return true;
  }
  if (left.sourceScenarioId !== right.sourceScenarioId) return false;
  if (
    left.idempotencyScope === "scenario" ||
    right.idempotencyScope === "scenario"
  ) {
    return true;
  }
  return left.sourceChoiceId === right.sourceChoiceId;
}
