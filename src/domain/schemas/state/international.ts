import { z } from "zod";

import { normalizedScoreSchema } from "../common/numeric";

export const internationalStateSchema = z
  .object({
    caldrisRelations: normalizedScoreSchema,
    dromirRelations: normalizedScoreSchema,
    dravicaRelations: normalizedScoreSchema,
    belvarRelations: normalizedScoreSchema,
    cyraneRelations: normalizedScoreSchema,
    internationalReputation: normalizedScoreSchema,
    tradeAccess: normalizedScoreSchema,
    diplomaticLeverage: normalizedScoreSchema,
    foreignAidDependence: normalizedScoreSchema,
    sanctionsRisk: normalizedScoreSchema,
  })
  .strict();

export type InternationalState = z.infer<typeof internationalStateSchema>;
