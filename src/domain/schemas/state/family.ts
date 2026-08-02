import { z } from "zod";

import { memoryIdSchema } from "../../ids/identifier-schemas";
import { normalizedScoreSchema } from "../common/numeric";

export const familyStateSchema = z
  .object({
    spouseTrust: normalizedScoreSchema,
    daughterTrust: normalizedScoreSchema,
    sonTrust: normalizedScoreSchema,
    siblingTrust: normalizedScoreSchema,
    familyPublicReputation: normalizedScoreSchema,
    spousePublicReputation: normalizedScoreSchema,
    familyScandalRisk: normalizedScoreSchema,
    memoryIds: z.array(memoryIdSchema),
  })
  .strict();

export type FamilyState = z.infer<typeof familyStateSchema>;
