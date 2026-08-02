import { z } from "zod";

import { flagIdSchema, memoryIdSchema } from "../../ids/identifier-schemas";
import { normalizedScoreSchema } from "../common/numeric";

export const regionalInfluenceStateSchema = z
  .object({
    orsanne_metropolitan_district: normalizedScoreSchema,
    kestrel_industrial_basin: normalizedScoreSchema,
    lydra_agricultural_plain: normalizedScoreSchema,
    roven_marches: normalizedScoreSchema,
  })
  .strict();

export const factionStateSchema = z
  .object({
    support: normalizedScoreSchema,
    trust: normalizedScoreSchema,
    fear: normalizedScoreSchema,
    organization: normalizedScoreSchema,
    mobilization: normalizedScoreSchema,
    radicalization: normalizedScoreSchema,
    unity: normalizedScoreSchema,
    governmentAccess: normalizedScoreSchema,
    unmetDemandSeverity: normalizedScoreSchema,
    repressionMemory: normalizedScoreSchema,
    redLineViolations: z.array(flagIdSchema),
    memoryIds: z.array(memoryIdSchema),
    regionalInfluence: regionalInfluenceStateSchema,
  })
  .strict();

export const factionsStateSchema = z
  .object({
    civic_renewal_league: factionStateSchema,
    national_stewardship_union: factionStateSchema,
    workers_commonwealth: factionStateSchema,
  })
  .strict();

export type FactionState = z.infer<typeof factionStateSchema>;
export type FactionsState = z.infer<typeof factionsStateSchema>;
