import { describe, expect, it } from "vitest";

import { createNewGame } from "../initialization";
import { flagIdSchema } from "../ids/identifier-schemas";
import { createValidFamilyIdentityFixture } from "../test/fixtures";
import {
  annualGrowthBasisPointsSchema,
  normalizedScoreSchema,
} from "../schemas/common/numeric";
import type { RootGameState } from "../schemas/state/root-state";
import { memoryStateSchema } from "../schemas/state/memories";
import {
  calculateConfidenceProjection,
  calculateEconomicDerivedScores,
  calculateEconomicPeriodProjection,
  calculateTreasuryResolution,
} from "./economy";
import { calculateOutcomeScores, resolveMvpOutcome } from "./outcomes";
import {
  calculateAllFactionMetrics,
  calculateAverageRegionalUnrest,
  calculateFamilyUnity,
  calculateForeignLeverage,
  calculateGovernmentProjection,
  calculateMediaClimate,
  calculateMemoryPressure,
  calculateMemoryWeights,
  calculateRegionMetrics,
  calculateRelationshipMetrics,
  calculateSecurityMetrics,
} from "./political";

function createSave(seed = "task_09_fixed_seed_1983") {
  return createNewGame({
    saveId: "4cc946fc-22a0-4db1-991f-cf3d93bc11c7",
    ownerId: "cff44bfa-f366-426a-b2b8-1b54f1ad2de3",
    saveVersion: "save-1.0.0",
    contentVersion: "mvp-0.1.0",
    schemaVersion: "schema-1.0.0",
    gameSeed: seed,
    selectedBackground: "civil_service_reformer",
    familyIdentity: createValidFamilyIdentityFixture(),
    createdAt: "1983-01-01T00:00:00.000Z",
    updatedAt: "1983-01-01T00:00:00.000Z",
  });
}

function createState(): RootGameState {
  return structuredClone(createSave().authoritativeState);
}

function highOutcomeState(): RootGameState {
  const state = createState();
  Object.assign(state.government, {
    governmentLegitimacy: 80,
    constitutionalCompliance: 80,
    cabinetUnity: 80,
    assemblySupport: 80,
    civilServiceEfficiency: 80,
    electionIntegrity: 80,
    emergencyAuthority: 80,
  });
  Object.values(state.factions).forEach((faction) => {
    faction.trust = normalizedScoreSchema.parse(80);
  });
  Object.values(state.regions).forEach((region) => {
    region.protestIntensity = normalizedScoreSchema.parse(20);
    region.approval = normalizedScoreSchema.parse(80);
  });
  Object.assign(state.security, {
    armyLoyalty: 80,
    policeLoyalty: 80,
    intelligenceLoyalty: 80,
    borderSecurity: 80,
    borderTension: 20,
    armyAlertLevel: 20,
    foreignInfiltrationRisk: 20,
    intelligenceUncertainty: 20,
    publicRetaliationDemand: 20,
  });
  state.international.dravicaRelations = normalizedScoreSchema.parse(80);
  return state;
}

describe("MVP economic calculations", () => {
  it("resolves obligations, bounded arrears payment, and exact money", () => {
    const economy = createState().economy;
    Object.assign(economy, {
      treasuryMinor: 1_000n,
      monthlyRevenueMinor: 500n,
      monthlyExpenditureMinor: 600n,
      monthlyDebtServiceMinor: 100n,
      periodProjectOutflowsMinor: 50n,
      periodFinancingInflowsMinor: 100n,
      plannedArrearsPaymentMinor: 500n,
      arrearsMinor: 400n,
    });
    expect(calculateTreasuryResolution(economy)).toEqual({
      currentObligationsMinor: 750n,
      cashAfterCurrentObligationsMinor: 850n,
      actualArrearsPaymentMinor: 400n,
      nextTreasuryMinor: 450n,
      nextArrearsMinor: 0n,
    });
  });

  it("turns a cash deficit into arrears without automatic borrowing", () => {
    const economy = createState().economy;
    Object.assign(economy, {
      treasuryMinor: 0n,
      monthlyRevenueMinor: 100n,
      monthlyExpenditureMinor: 250n,
      monthlyDebtServiceMinor: 50n,
      periodProjectOutflowsMinor: 0n,
      periodFinancingInflowsMinor: 0n,
      arrearsMinor: 20n,
      plannedArrearsPaymentMinor: 20n,
    });
    expect(calculateTreasuryResolution(economy)).toMatchObject({
      cashAfterCurrentObligationsMinor: -200n,
      actualArrearsPaymentMinor: 0n,
      nextTreasuryMinor: 0n,
      nextArrearsMinor: 220n,
    });
  });

  it("covers every derived score and documented stress boundary", () => {
    const economy = createState().economy;
    Object.assign(economy, {
      monthlyRevenueMinor: 100n,
      monthlyExpenditureMinor: 100n,
      monthlyDebtServiceMinor: 100n,
      periodProjectOutflowsMinor: 0n,
      arrearsMinor: 200n,
      foodSupply: 100,
      fuelSupply: 0,
      inflationBps: 2_300,
      unemploymentBps: 2_000,
      annualGrowthBps: -500,
    });
    expect(calculateEconomicDerivedScores(economy)).toEqual({
      deficitStress: 100,
      arrearsStress: 100,
      supplyStability: 55,
      inflationStress: 100,
      unemploymentStress: 100,
      growthScore: 0,
      fiscalSolvency: 0,
    });
    economy.annualGrowthBps = annualGrowthBasisPointsSchema.parse(500);
    expect(calculateEconomicDerivedScores(economy).growthScore).toBe(100);
  });

  it("matches every period target, bounded approach, and exact revenue formula", () => {
    const economy = createState().economy;
    Object.assign(economy, {
      monthlyRevenueMinor: 10_001n,
      monthlyExpenditureMinor: 10_001n,
      monthlyDebtServiceMinor: 0n,
      arrearsMinor: 0n,
      inflationBps: 1_000,
      annualGrowthBps: 120,
      unemploymentBps: 900,
      foodSupply: 50,
      fuelSupply: 50,
      currencyStability: 50,
      industrialOutput: 50,
      agriculturalOutput: 50,
      infrastructure: 50,
      investorConfidence: 50,
      consumerConfidence: 50,
      corruption: 60,
    });
    expect(
      calculateEconomicPeriodProjection(economy, {
        priceStabilityReliefBps: 100,
        employmentReliefBps: 100,
        regionalEmploymentShockBps: 100,
        civilServiceEfficiency: 60,
      }),
    ).toEqual({
      inflationTargetBps: 1_050,
      nextInflationBps: 1_013,
      growthTargetBps: 20,
      nextAnnualGrowthBps: 87,
      unemploymentTargetBps: 1_152,
      nextUnemploymentBps: 963,
      collectionAdjustmentBps: 10,
      nextMonthlyRevenueMinor: 10_011n,
    });
  });

  it("rejects out-of-contract authored relief inputs", () => {
    expect(() =>
      calculateEconomicPeriodProjection(createState().economy, {
        priceStabilityReliefBps: 501,
        employmentReliefBps: 0,
        regionalEmploymentShockBps: 0,
        civilServiceEfficiency: 50,
      }),
    ).toThrow(/0\.\.500/);
    expect(() =>
      calculateEconomicPeriodProjection(createState().economy, {
        priceStabilityReliefBps: 0,
        employmentReliefBps: 601,
        regionalEmploymentShockBps: 0,
        civilServiceEfficiency: 50,
      }),
    ).toThrow(/0\.\.600/);
    expect(() =>
      calculateEconomicPeriodProjection(createState().economy, {
        priceStabilityReliefBps: 0,
        employmentReliefBps: 0,
        regionalEmploymentShockBps: -1,
        civilServiceEfficiency: 50,
      }),
    ).toThrow(/0\.\.600/);
  });

  it("calculates confidence targets and approach limits", () => {
    const result = calculateConfidenceProjection({
      economy: createState().economy,
      governmentLegitimacy: 50,
      borderEscalation: 75,
    });
    expect(result.borderStability).toBe(25);
    expect(
      Math.abs(
        result.nextConsumerConfidence -
          createState().economy.consumerConfidence,
      ),
    ).toBeLessThanOrEqual(6);
    expect(
      Math.abs(
        result.nextInvestorConfidence -
          createState().economy.investorConfidence,
      ),
    ).toBeLessThanOrEqual(5);
  });
});

describe("MVP government, faction, relationship, and memory calculations", () => {
  it("matches government targets, minister averages, penalties, and approach caps", () => {
    const state = createState();
    const result = calculateGovernmentProjection({
      government: state.government,
      factions: state.factions,
      regions: state.regions,
      consumerConfidence: state.economy.consumerConfidence,
      supplyStability: 60,
      familyPublicReputation: state.family.familyPublicReputation,
      ministerRelationships: [
        state.relationships.mara_edevane,
        state.relationships.lucien_kest,
      ],
    });
    expect(result.averageFactionTrust).toBe(46);
    expect(
      Math.abs(
        result.nextGovernmentLegitimacy - state.government.governmentLegitimacy,
      ),
    ).toBeLessThanOrEqual(5);
    expect(
      Math.abs(result.nextPublicApproval - state.government.publicApproval),
    ).toBeLessThanOrEqual(5);
    expect(result.averageMinisterTrust).toBe(50);
    expect(result.averageMinisterRespect).toBe(50);
    expect(
      Math.abs(result.nextCabinetUnity - state.government.cabinetUnity),
    ).toBeLessThanOrEqual(4);
  });

  it("rejects an undefined empty minister average", () => {
    const state = createState();
    expect(() =>
      calculateGovernmentProjection({
        government: state.government,
        factions: state.factions,
        regions: state.regions,
        consumerConfidence: 50,
        supplyStability: 50,
        familyPublicReputation: 50,
        ministerRelationships: [],
      }),
    ).toThrow(/currently serving minister/);
  });

  it("calculates all faction grievance, mobilization, and pressure independently", () => {
    const state = createState();
    const before = structuredClone(state.factions);
    const metrics = calculateAllFactionMetrics(state.factions);
    expect(Object.keys(metrics)).toHaveLength(3);
    expect(metrics.civic_renewal_league).toEqual({
      factionGrievance: 33,
      factionMobilization: 42,
      factionPressure: 50,
    });
    expect(state.factions).toEqual(before);
  });

  it("separates fear penalty, leverage bonus, cooperation, and candor", () => {
    const relationship = createState().relationships.mara_edevane;
    Object.assign(relationship, {
      trust: 70,
      respect: 60,
      fear: 80,
      personalLeverage: 50,
      ideologicalAlignment: 50,
      privateRelationship: 70,
      publicRelationship: 60,
    });
    expect(calculateRelationshipMetrics(relationship)).toEqual({
      fearPenalty: 10,
      leverageBonus: 10,
      willingnessToCooperate: 64,
      candor: 63,
    });
  });

  it("decays non-permanent memories, preserves permanent ones, and clamps pressure", () => {
    const base = memoryStateSchema.parse({
      id: "memory_test",
      subjectId: "mara_edevane",
      targetId: "president",
      sourceScenarioId: "scenario_test",
      sourceChoiceId: "choice_test",
      emotionalWeight: -80,
      politicalWeight: 70,
      visibility: "developer_only",
      creationPeriod: 2,
      decayRatePerPeriod: 25,
      permanent: false,
      dialogueInfluenceTags: [],
      eventInfluenceTags: [],
      outcomeInfluenceTags: [],
    });
    expect(calculateMemoryWeights(base, 4)).toEqual({
      ageInPeriods: 2,
      remainingPercent: 50,
      effectiveEmotionalWeight: -40,
      effectivePoliticalWeight: 35,
    });
    expect(() => calculateMemoryWeights(base, 1)).toThrow(
      /at or after memory creation/,
    );
    const permanent = memoryStateSchema.parse({
      ...base,
      permanent: true,
      decayRatePerPeriod: 0,
    });
    expect(calculateMemoryWeights(permanent, 6).remainingPercent).toBe(100);
    expect(calculateMemoryPressure([500, 500])).toBe(20);
    expect(calculateMemoryPressure([-500, -500])).toBe(-20);
  });
});

describe("MVP regional, security, diplomatic, family, and media calculations", () => {
  it("keeps regional projections independent and computes the national unrest average only", () => {
    const state = createState();
    const first = calculateRegionMetrics(
      state.regions.orsanne_metropolitan_district,
      state.government.publicApproval,
      10,
    );
    const second = calculateRegionMetrics(
      state.regions.kestrel_industrial_basin,
      state.government.publicApproval,
      90,
    );
    expect(first.regionalUnrestTarget).not.toBe(second.regionalUnrestTarget);
    const untouched = state.regions.kestrel_industrial_basin.approval;
    calculateRegionMetrics(state.regions.orsanne_metropolitan_district, 0, 100);
    expect(state.regions.kestrel_industrial_basin.approval).toBe(untouched);
    expect(() =>
      calculateRegionMetrics(
        state.regions.orsanne_metropolitan_district,
        state.government.publicApproval,
        -1,
      ),
    ).toThrow(/localFactionMobilization/);
    expect(calculateAverageRegionalUnrest(state.regions)).toBe(45);
  });

  it("calculates security instability, border escalation, and its inverse", () => {
    const state = createState();
    const result = calculateSecurityMetrics(state.security, 50, 40, 30);
    expect(result.borderStability).toBe(100 - result.borderEscalation);
    expect(result.securityInstability).toBeGreaterThanOrEqual(0);
    expect(result.securityInstability).toBeLessThanOrEqual(100);
  });

  it("calculates foreign leverage and family unity as documented weighted averages", () => {
    const state = createState();
    expect(calculateForeignLeverage(state.international, 50)).toBe(52);
    expect(calculateFamilyUnity(state.family)).toBe(59);
  });

  it("calculates qualifying media sentiment, returns null for none, and rejects zero denominator", () => {
    expect(calculateMediaClimate(50, [])).toBeNull();
    expect(
      calculateMediaClimate(50, [
        { sentiment: 100, reach: 100, credibility: 100 },
        { sentiment: -100, reach: 50, credibility: 100 },
      ]),
    ).toEqual({
      weightedMediaSentiment: 33,
      mediaClimateTarget: 67,
      nextMediaClimate: 58,
    });
    expect(() =>
      calculateMediaClimate(50, [{ sentiment: 10, reach: 0, credibility: 0 }]),
    ).toThrow(/positive combined/);
  });
});

describe("MVP outcome resolution and deterministic evidence", () => {
  it("makes civic stabilization reachable and gives it first priority", () => {
    const result = resolveMvpOutcome({
      state: highOutcomeState(),
      chapterOneComplete: true,
    });
    expect(result?.selectedOutcomeId).toBe("mvp_civic_stabilization");
    expect(result?.eligibility.civicStabilization).toBe(true);
    expect(result?.contributingValues).toMatchObject({
      chapterOneComplete: true,
      severeConstitutionalBreachAbsent: true,
    });
  });

  it("makes ordered emergency reachable only after civic is not selected", () => {
    const state = highOutcomeState();
    state.government.constitutionalCompliance = normalizedScoreSchema.parse(40);
    const result = resolveMvpOutcome({ state, chapterOneComplete: true });
    expect(result?.selectedOutcomeId).toBe("mvp_ordered_emergency");
    expect(result?.eligibility).toMatchObject({
      civicStabilization: false,
      orderedEmergency: true,
    });
  });

  it("uses fractured mandate as the intentional valid-state fallback", () => {
    const state = highOutcomeState();
    Object.assign(state.government, {
      constitutionalCompliance: 20,
      emergencyAuthority: 0,
      governmentLegitimacy: 10,
      cabinetUnity: 10,
    });
    expect(
      resolveMvpOutcome({ state, chapterOneComplete: true })?.selectedOutcomeId,
    ).toBe("mvp_fractured_mandate");
  });

  it("does not resolve before Chapter 1 completion and never hides invalid state", () => {
    expect(
      resolveMvpOutcome({
        state: highOutcomeState(),
        chapterOneComplete: false,
      }),
    ).toBeNull();
    const invalid = highOutcomeState();
    Object.assign(invalid.government, { publicApproval: 101 });
    expect(() =>
      resolveMvpOutcome({ state: invalid, chapterOneComplete: true }),
    ).toThrow();
  });

  it("honors severe flags and preserves explicit priority constraints", () => {
    const civicBlocked = highOutcomeState();
    civicBlocked.flags.push(flagIdSchema.parse("severe_constitutional_breach"));
    expect(
      resolveMvpOutcome({ state: civicBlocked, chapterOneComplete: true })
        ?.selectedOutcomeId,
    ).toBe("mvp_ordered_emergency");
    const bothBlocked = highOutcomeState();
    bothBlocked.flags.push(
      flagIdSchema.parse("severe_constitutional_breach"),
      flagIdSchema.parse("security_command_breakdown"),
    );
    expect(
      resolveMvpOutcome({ state: bothBlocked, chapterOneComplete: true })
        ?.selectedOutcomeId,
    ).toBe("mvp_fractured_mandate");
  });

  it("replays fixed-seed simulations identically and does not mutate authoritative input", () => {
    const firstSave = createSave("repeatable_task_09_seed");
    const secondSave = createSave("repeatable_task_09_seed");
    const before = structuredClone(firstSave.authoritativeState);
    const first = {
      scores: calculateOutcomeScores(firstSave.authoritativeState),
      outcome: resolveMvpOutcome({
        state: firstSave.authoritativeState,
        chapterOneComplete: true,
      }),
    };
    const second = {
      scores: calculateOutcomeScores(secondSave.authoritativeState),
      outcome: resolveMvpOutcome({
        state: secondSave.authoritativeState,
        chapterOneComplete: true,
      }),
    };
    expect(first).toEqual(second);
    expect(firstSave.authoritativeState).toEqual(before);
  });
});
