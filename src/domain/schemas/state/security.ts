import { z } from "zod";

import { normalizedScoreSchema } from "../common/numeric";

export const securityStateSchema = z
  .object({
    armyLoyalty: normalizedScoreSchema,
    armyReadiness: normalizedScoreSchema,
    armyAlertLevel: normalizedScoreSchema,
    policeLoyalty: normalizedScoreSchema,
    intelligenceLoyalty: normalizedScoreSchema,
    presidentialGuardLoyalty: normalizedScoreSchema,
    borderSecurity: normalizedScoreSchema,
    foreignInfiltrationRisk: normalizedScoreSchema,
    borderTension: normalizedScoreSchema,
    publicRetaliationDemand: normalizedScoreSchema,
    intelligenceUncertainty: normalizedScoreSchema,
  })
  .strict();

export type SecurityState = z.infer<typeof securityStateSchema>;
