import { z } from "zod";

import {
  projectIdSchema,
  scenarioIdSchema,
} from "../../ids/identifier-schemas";
import {
  normalizedScoreSchema,
  unemploymentBasisPointsSchema,
} from "../common/numeric";

export const dominantFactionInfluencesSchema = z
  .object({
    civic_renewal_league: normalizedScoreSchema,
    national_stewardship_union: normalizedScoreSchema,
    workers_commonwealth: normalizedScoreSchema,
  })
  .strict();

export const regionStateSchema = z
  .object({
    approval: normalizedScoreSchema,
    localEconomy: normalizedScoreSchema,
    unemploymentBps: unemploymentBasisPointsSchema,
    foodSupply: normalizedScoreSchema,
    fuelSupply: normalizedScoreSchema,
    infrastructure: normalizedScoreSchema,
    securityTension: normalizedScoreSchema,
    protestIntensity: normalizedScoreSchema,
    militaryPresence: normalizedScoreSchema,
    dominantFactionInfluences: dominantFactionInfluencesSchema,
    activeProjectIds: z.array(projectIdSchema),
    activeCrisisIds: z.array(scenarioIdSchema),
    governorTrust: normalizedScoreSchema,
  })
  .strict();

export const regionsStateSchema = z
  .object({
    orsanne_metropolitan_district: regionStateSchema,
    kestrel_industrial_basin: regionStateSchema,
    lydra_agricultural_plain: regionStateSchema,
    roven_marches: regionStateSchema,
  })
  .strict();

export type RegionState = z.infer<typeof regionStateSchema>;
export type RegionsState = z.infer<typeof regionsStateSchema>;
