import {
  approach,
  clamp,
  clamp100,
  clampBigInt,
  roundNearest,
  roundNearestBigInt,
  weightedAverage,
} from "../arithmetic";
import {
  economyStateSchema,
  type EconomyState,
} from "../schemas/state/economy";

export interface TreasuryResolution {
  readonly currentObligationsMinor: bigint;
  readonly cashAfterCurrentObligationsMinor: bigint;
  readonly actualArrearsPaymentMinor: bigint;
  readonly nextTreasuryMinor: bigint;
  readonly nextArrearsMinor: bigint;
}

export interface EconomicDerivedScores {
  readonly deficitStress: number;
  readonly arrearsStress: number;
  readonly supplyStability: number;
  readonly inflationStress: number;
  readonly unemploymentStress: number;
  readonly growthScore: number;
  readonly fiscalSolvency: number;
}

export interface EconomicPeriodInputs {
  readonly priceStabilityReliefBps: number;
  readonly employmentReliefBps: number;
  readonly regionalEmploymentShockBps: number;
  readonly civilServiceEfficiency: number;
}

export interface EconomicPeriodProjection {
  readonly inflationTargetBps: number;
  readonly nextInflationBps: number;
  readonly growthTargetBps: number;
  readonly nextAnnualGrowthBps: number;
  readonly unemploymentTargetBps: number;
  readonly nextUnemploymentBps: number;
  readonly collectionAdjustmentBps: number;
  readonly nextMonthlyRevenueMinor: bigint;
}

function assertIntegerRange(
  value: number,
  name: string,
  minimum: number,
  maximum: number,
): void {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new RangeError(
      `${name} must be an integer in ${minimum}..${maximum}.`,
    );
  }
}

export function calculateTreasuryResolution(
  input: EconomyState,
): TreasuryResolution {
  const economy = economyStateSchema.parse(input);
  const currentObligationsMinor =
    economy.monthlyExpenditureMinor +
    economy.monthlyDebtServiceMinor +
    economy.periodProjectOutflowsMinor;
  const cashAfterCurrentObligationsMinor =
    economy.treasuryMinor +
    economy.monthlyRevenueMinor +
    economy.periodFinancingInflowsMinor -
    currentObligationsMinor;

  if (cashAfterCurrentObligationsMinor < 0n) {
    return {
      currentObligationsMinor,
      cashAfterCurrentObligationsMinor,
      actualArrearsPaymentMinor: 0n,
      nextTreasuryMinor: 0n,
      nextArrearsMinor:
        economy.arrearsMinor + -cashAfterCurrentObligationsMinor,
    };
  }

  const actualArrearsPaymentMinor = [
    economy.plannedArrearsPaymentMinor,
    economy.arrearsMinor,
    cashAfterCurrentObligationsMinor,
  ].reduce((minimum, value) => (value < minimum ? value : minimum));

  return {
    currentObligationsMinor,
    cashAfterCurrentObligationsMinor,
    actualArrearsPaymentMinor,
    nextTreasuryMinor:
      cashAfterCurrentObligationsMinor - actualArrearsPaymentMinor,
    nextArrearsMinor: economy.arrearsMinor - actualArrearsPaymentMinor,
  };
}

export function calculateEconomicDerivedScores(
  input: EconomyState,
): EconomicDerivedScores {
  const economy = economyStateSchema.parse(input);
  const { currentObligationsMinor } = calculateTreasuryResolution(economy);
  const revenueDenominator =
    economy.monthlyRevenueMinor > 0n ? economy.monthlyRevenueMinor : 1n;
  const deficit =
    currentObligationsMinor > economy.monthlyRevenueMinor
      ? currentObligationsMinor - economy.monthlyRevenueMinor
      : 0n;
  const deficitStress = Number(
    clampBigInt(
      roundNearestBigInt(deficit * 100n, revenueDenominator),
      0n,
      100n,
    ),
  );
  const arrearsStress = Number(
    clampBigInt(
      roundNearestBigInt(economy.arrearsMinor * 50n, revenueDenominator),
      0n,
      100n,
    ),
  );
  const supplyStability = weightedAverage([
    { value: economy.foodSupply, weight: 55 },
    { value: economy.fuelSupply, weight: 45 },
  ]);
  const inflationStress = clamp100(
    roundNearest(Math.max(0, economy.inflationBps - 300), 20),
  );
  const unemploymentStress = clamp100(
    roundNearest(Math.max(0, economy.unemploymentBps - 400), 16),
  );
  const growthScore = clamp100(50 + roundNearest(economy.annualGrowthBps, 10));
  const fiscalSolvency = clamp100(
    100 -
      roundNearest(deficitStress * 60, 100) -
      roundNearest(arrearsStress * 40, 100),
  );

  return {
    deficitStress,
    arrearsStress,
    supplyStability,
    inflationStress,
    unemploymentStress,
    growthScore,
    fiscalSolvency,
  };
}

export function calculateEconomicPeriodProjection(
  input: EconomyState,
  periodInputs: EconomicPeriodInputs,
): EconomicPeriodProjection {
  const economy = economyStateSchema.parse(input);
  assertIntegerRange(
    periodInputs.priceStabilityReliefBps,
    "priceStabilityReliefBps",
    0,
    500,
  );
  assertIntegerRange(
    periodInputs.employmentReliefBps,
    "employmentReliefBps",
    0,
    600,
  );
  assertIntegerRange(
    periodInputs.regionalEmploymentShockBps,
    "regionalEmploymentShockBps",
    0,
    600,
  );
  assertIntegerRange(
    periodInputs.civilServiceEfficiency,
    "civilServiceEfficiency",
    0,
    100,
  );

  const scores = calculateEconomicDerivedScores(economy);
  const inflationTargetBps = clamp(
    200 +
      (100 - economy.foodSupply) * 8 +
      (100 - economy.fuelSupply) * 6 +
      scores.deficitStress * 5 +
      (100 - economy.currencyStability) * 5 +
      scores.arrearsStress * 4 -
      periodInputs.priceStabilityReliefBps,
    200,
    3000,
  );
  const nextInflationBps = clamp(
    economy.inflationBps +
      clamp(
        roundNearest(inflationTargetBps - economy.inflationBps, 4),
        -250,
        300,
      ),
    0,
    5000,
  );
  const growthTargetBps = clamp(
    -300 +
      economy.industrialOutput * 4 +
      economy.agriculturalOutput * 2 +
      economy.infrastructure * 2 +
      economy.investorConfidence * 2 +
      economy.consumerConfidence -
      scores.inflationStress * 2 -
      (100 - economy.fuelSupply) * 2 -
      economy.corruption,
    -800,
    800,
  );
  const nextAnnualGrowthBps = clamp(
    economy.annualGrowthBps +
      clamp(
        roundNearest(growthTargetBps - economy.annualGrowthBps, 3),
        -150,
        150,
      ),
    -1000,
    1000,
  );
  const unemploymentTargetBps = clamp(
    600 +
      (100 - economy.industrialOutput) * 8 +
      (100 - scores.growthScore) * 4 +
      periodInputs.regionalEmploymentShockBps -
      periodInputs.employmentReliefBps,
    300,
    3000,
  );
  const nextUnemploymentBps = clamp(
    economy.unemploymentBps +
      clamp(
        roundNearest(unemploymentTargetBps - economy.unemploymentBps, 4),
        -150,
        200,
      ),
    0,
    4000,
  );
  const collectionAdjustmentBps = clamp(
    roundNearest(economy.annualGrowthBps, 12) +
      (periodInputs.civilServiceEfficiency - 50) * 2 -
      Math.max(0, economy.corruption - 50) * 2,
    -250,
    250,
  );
  const nextMonthlyRevenueMinor = roundNearestBigInt(
    economy.monthlyRevenueMinor * BigInt(10_000 + collectionAdjustmentBps),
    10_000n,
  );

  return {
    inflationTargetBps,
    nextInflationBps,
    growthTargetBps,
    nextAnnualGrowthBps,
    unemploymentTargetBps,
    nextUnemploymentBps,
    collectionAdjustmentBps,
    nextMonthlyRevenueMinor,
  };
}

export function calculateConfidenceProjection(input: {
  readonly economy: EconomyState;
  readonly governmentLegitimacy: number;
  readonly borderEscalation: number;
}): {
  readonly consumerConfidenceTarget: number;
  readonly nextConsumerConfidence: number;
  readonly borderStability: number;
  readonly investorConfidenceTarget: number;
  readonly nextInvestorConfidence: number;
} {
  const economy = economyStateSchema.parse(input.economy);
  assertIntegerRange(
    input.governmentLegitimacy,
    "governmentLegitimacy",
    0,
    100,
  );
  assertIntegerRange(input.borderEscalation, "borderEscalation", 0, 100);
  const scores = calculateEconomicDerivedScores(economy);
  const consumerConfidenceTarget = weightedAverage([
    { value: scores.growthScore, weight: 20 },
    { value: 100 - scores.inflationStress, weight: 25 },
    { value: 100 - scores.unemploymentStress, weight: 20 },
    { value: scores.supplyStability, weight: 20 },
    { value: input.governmentLegitimacy, weight: 15 },
  ]);
  const borderStability = 100 - input.borderEscalation;
  const investorConfidenceTarget = weightedAverage([
    { value: economy.currencyStability, weight: 25 },
    { value: 100 - economy.corruption, weight: 20 },
    { value: input.governmentLegitimacy, weight: 15 },
    { value: economy.infrastructure, weight: 15 },
    { value: scores.growthScore, weight: 20 },
    { value: borderStability, weight: 5 },
  ]);

  return {
    consumerConfidenceTarget,
    nextConsumerConfidence: approach(
      economy.consumerConfidence,
      consumerConfidenceTarget,
      6,
    ),
    borderStability,
    investorConfidenceTarget,
    nextInvestorConfidence: approach(
      economy.investorConfidence,
      investorConfidenceTarget,
      5,
    ),
  };
}
