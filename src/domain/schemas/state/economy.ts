import { z } from "zod";

import {
  annualGrowthBasisPointsSchema,
  inflationBasisPointsSchema,
  normalizedScoreSchema,
  unemploymentBasisPointsSchema,
} from "../common/numeric";
import { moneyMinorSchema } from "../common/money";

export const economyStateSchema = z
  .object({
    treasuryMinor: moneyMinorSchema,
    monthlyRevenueMinor: moneyMinorSchema,
    monthlyExpenditureMinor: moneyMinorSchema,
    monthlyDebtServiceMinor: moneyMinorSchema,
    arrearsMinor: moneyMinorSchema,
    plannedArrearsPaymentMinor: moneyMinorSchema,
    periodFinancingInflowsMinor: moneyMinorSchema,
    periodProjectOutflowsMinor: moneyMinorSchema,
    inflationBps: inflationBasisPointsSchema,
    unemploymentBps: unemploymentBasisPointsSchema,
    annualGrowthBps: annualGrowthBasisPointsSchema,
    currencyStability: normalizedScoreSchema,
    foodSupply: normalizedScoreSchema,
    fuelSupply: normalizedScoreSchema,
    industrialOutput: normalizedScoreSchema,
    agriculturalOutput: normalizedScoreSchema,
    infrastructure: normalizedScoreSchema,
    corruption: normalizedScoreSchema,
    investorConfidence: normalizedScoreSchema,
    consumerConfidence: normalizedScoreSchema,
  })
  .strict();

export type EconomyState = z.infer<typeof economyStateSchema>;
