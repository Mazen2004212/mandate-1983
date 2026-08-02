import { z } from "zod";

import { memoryIdSchema } from "../../ids/identifier-schemas";
import { normalizedScoreSchema } from "../common/numeric";

export const relationshipStateSchema = z
  .object({
    trust: normalizedScoreSchema,
    respect: normalizedScoreSchema,
    fear: normalizedScoreSchema,
    affection: normalizedScoreSchema.optional(),
    ideologicalAlignment: normalizedScoreSchema,
    personalLeverage: normalizedScoreSchema,
    publicRelationship: normalizedScoreSchema,
    privateRelationship: normalizedScoreSchema,
    temporaryMemoryIds: z.array(memoryIdSchema),
    permanentMemoryIds: z.array(memoryIdSchema),
  })
  .strict();

export const relationshipsStateSchema = z
  .object({
    mara_edevane: relationshipStateSchema,
    lucien_kest: relationshipStateSchema,
    sabine_orrel: relationshipStateSchema,
    darek_voln: relationshipStateSchema,
    ilona_meret: relationshipStateSchema,
    tomas_veyr: relationshipStateSchema,
    celia_rovan: relationshipStateSchema,
    ansel_mire: relationshipStateSchema,
  })
  .strict();

export type RelationshipState = z.infer<typeof relationshipStateSchema>;
export type RelationshipsState = z.infer<typeof relationshipsStateSchema>;
