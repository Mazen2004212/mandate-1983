import { z } from "zod";

import {
  difficultySchema,
  politicalBackgroundIdSchema,
} from "../common/classifications";
import { familyIdentitySchema } from "../common/family-identity";
import { politicalPeriodSchema } from "../common/numeric";
import { economyStateSchema } from "./economy";
import { factionsStateSchema } from "./factions";
import { familyStateSchema } from "./family";
import { governmentStateSchema } from "./government";
import { internationalStateSchema } from "./international";
import { memoriesStateSchema } from "./memories";
import { regionsStateSchema } from "./regions";
import { relationshipsStateSchema } from "./relationships";
import {
  cabinetStateSchema,
  charactersStateSchema,
  delayedEffectsStateSchema,
  eventHistoryStateSchema,
  flagsStateSchema,
  lawsAndMeasuresStateSchema,
  mediaStateSchema,
  outcomeStateSchema,
  pendingEventsStateSchema,
} from "./runtime";
import { securityStateSchema } from "./security";

export const stateMetadataSchema = z
  .object({
    difficulty: difficultySchema,
  })
  .strict();

export const stateIdentitySchema = z
  .object({
    selectedBackground: politicalBackgroundIdSchema,
    familyIdentity: familyIdentitySchema,
  })
  .strict();

export const timelineStateSchema = z
  .object({
    politicalPeriod: politicalPeriodSchema,
  })
  .strict();

// The authoritative documents name these domains but define no TASK-03 fields.
// Strict empty objects prevent accidental state invention until a later task adds
// an explicitly documented contract.
export const nationalStateSchema = z.object({}).strict();
export const debugMetadataStateSchema = z.object({}).strict();

export const rootGameStateSchema = z
  .object({
    metadata: stateMetadataSchema,
    identity: stateIdentitySchema,
    timeline: timelineStateSchema,
    national: nationalStateSchema,
    economy: economyStateSchema,
    government: governmentStateSchema,
    security: securityStateSchema,
    international: internationalStateSchema,
    factions: factionsStateSchema,
    characters: charactersStateSchema,
    relationships: relationshipsStateSchema,
    memories: memoriesStateSchema,
    regions: regionsStateSchema,
    family: familyStateSchema,
    cabinet: cabinetStateSchema,
    lawsAndMeasures: lawsAndMeasuresStateSchema,
    flags: flagsStateSchema,
    eventHistory: eventHistoryStateSchema,
    pendingEvents: pendingEventsStateSchema,
    delayedEffects: delayedEffectsStateSchema,
    media: mediaStateSchema,
    outcomeState: outcomeStateSchema,
    debugMetadata: debugMetadataStateSchema,
  })
  .strict()
  .superRefine((state, context) => {
    const choiceHistoryByIdempotencyKey = new Map(
      state.eventHistory
        .filter((entry) => entry.type === "choice_resolution")
        .map((entry) => [String(entry.idempotencyKey), entry] as const),
    );

    state.delayedEffects.forEach((effect, index) => {
      const source = choiceHistoryByIdempotencyKey.get(
        String(effect.sourceMutationIdempotencyKey),
      );
      if (source === undefined) {
        context.addIssue({
          code: "custom",
          path: ["delayedEffects", index, "sourceMutationIdempotencyKey"],
          message:
            "Delayed-effect runtime state must reference an accepted choice-resolution history entry.",
        });
        return;
      }
      if (
        source.scenarioId !== effect.sourceScenarioId ||
        source.choiceId !== effect.sourceChoiceId
      ) {
        context.addIssue({
          code: "custom",
          path: ["delayedEffects", index, "sourceScenarioId"],
          message:
            "Delayed-effect source scenario and choice must match its originating choice-resolution receipt.",
        });
      }
      if (!source.scheduledDelayedEffectIds.includes(effect.id)) {
        context.addIssue({
          code: "custom",
          path: ["delayedEffects", index, "id"],
          message:
            "Delayed-effect runtime state must be listed by its originating choice-resolution receipt.",
        });
      }
    });
  });

export type RootGameState = z.infer<typeof rootGameStateSchema>;
