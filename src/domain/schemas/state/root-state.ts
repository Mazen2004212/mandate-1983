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
  .strict();

export type RootGameState = z.infer<typeof rootGameStateSchema>;
