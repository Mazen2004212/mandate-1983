import { z } from "zod";

import {
  governmentPenaltySchema,
  normalizedScoreSchema,
} from "../common/numeric";

export const governmentStateSchema = z
  .object({
    publicApproval: normalizedScoreSchema,
    governmentLegitimacy: normalizedScoreSchema,
    assemblySupport: normalizedScoreSchema,
    cabinetUnity: normalizedScoreSchema,
    civilServiceEfficiency: normalizedScoreSchema,
    constitutionalCompliance: normalizedScoreSchema,
    pressFreedom: normalizedScoreSchema,
    electionIntegrity: normalizedScoreSchema,
    emergencyAuthority: normalizedScoreSchema,
    mediaClimate: normalizedScoreSchema,
    activeScandalPenalty: governmentPenaltySchema,
    repressionPenalty: governmentPenaltySchema,
    publicCabinetConflictPenalty: governmentPenaltySchema,
  })
  .strict();

export type GovernmentState = z.infer<typeof governmentStateSchema>;
