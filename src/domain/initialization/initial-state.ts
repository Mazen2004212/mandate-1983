import type { FamilyIdentity } from "../schemas/common/family-identity";
import type { PoliticalBackgroundId } from "../schemas/common/classifications";
import {
  rootGameStateSchema,
  type RootGameState,
} from "../schemas/state/root-state";
import { INITIAL_DIFFICULTY, INITIAL_POLITICAL_PERIOD } from "./constants";

export interface InitializationDraft {
  readonly authoritativeState: RootGameState;
  readonly appliedBackground: PoliticalBackgroundId | null;
}

interface InitialStateInput {
  readonly selectedBackground: PoliticalBackgroundId;
  readonly familyIdentity: FamilyIdentity;
}

function createFactionState(values: {
  readonly support: number;
  readonly trust: number;
  readonly fear: number;
  readonly organization: number;
  readonly radicalization: number;
  readonly unity: number;
  readonly governmentAccess: number;
  readonly unmetDemandSeverity: number;
  readonly repressionMemory: number;
}) {
  return {
    ...values,
    mobilization: 0,
    redLineViolations: [],
    memoryIds: [],
    regionalInfluence: {
      orsanne_metropolitan_district: 0,
      kestrel_industrial_basin: 0,
      lydra_agricultural_plain: 0,
      roven_marches: 0,
    },
  };
}

function createCharacterState() {
  return { availability: "active" as const, memoryIds: [] };
}

function createRelationshipState() {
  return {
    trust: 50,
    respect: 50,
    fear: 0,
    ideologicalAlignment: 0,
    personalLeverage: 0,
    publicRelationship: 50,
    privateRelationship: 50,
    temporaryMemoryIds: [],
    permanentMemoryIds: [],
  };
}

function createRegionState(values: {
  readonly approval: number;
  readonly localEconomy: number;
  readonly unemploymentBps: number;
  readonly foodSupply: number;
  readonly fuelSupply: number;
  readonly infrastructure: number;
  readonly securityTension: number;
  readonly protestIntensity: number;
  readonly militaryPresence: number;
  readonly governorTrust: number;
}) {
  return {
    ...values,
    dominantFactionInfluences: {
      civic_renewal_league: 0,
      national_stewardship_union: 0,
      workers_commonwealth: 0,
    },
    activeProjectIds: [],
    activeCrisisIds: [],
  };
}

export function createInitialStateDraft({
  selectedBackground,
  familyIdentity,
}: InitialStateInput): InitializationDraft {
  const authoritativeState = rootGameStateSchema.parse({
    metadata: { difficulty: INITIAL_DIFFICULTY },
    identity: { selectedBackground, familyIdentity },
    timeline: { politicalPeriod: INITIAL_POLITICAL_PERIOD },
    national: {},
    economy: {
      treasuryMinor: 4_800_000_000n,
      monthlyRevenueMinor: 1_220_000_000n,
      monthlyExpenditureMinor: 1_380_000_000n,
      monthlyDebtServiceMinor: 140_000_000n,
      arrearsMinor: 240_000_000n,
      plannedArrearsPaymentMinor: 0n,
      periodFinancingInflowsMinor: 0n,
      periodProjectOutflowsMinor: 0n,
      inflationBps: 1120,
      unemploymentBps: 980,
      annualGrowthBps: -120,
      currencyStability: 43,
      foodSupply: 49,
      fuelSupply: 44,
      industrialOutput: 52,
      agriculturalOutput: 46,
      infrastructure: 50,
      corruption: 61,
      investorConfidence: 38,
      consumerConfidence: 35,
    },
    government: {
      publicApproval: 49,
      governmentLegitimacy: 52,
      assemblySupport: 41,
      cabinetUnity: 55,
      civilServiceEfficiency: 58,
      constitutionalCompliance: 68,
      pressFreedom: 64,
      electionIntegrity: 58,
      emergencyAuthority: 0,
      mediaClimate: 50,
      activeScandalPenalty: 0,
      repressionPenalty: 0,
      publicCabinetConflictPenalty: 0,
    },
    security: {
      armyLoyalty: 58,
      armyReadiness: 49,
      policeLoyalty: 53,
      intelligenceLoyalty: 51,
      presidentialGuardLoyalty: 65,
      borderSecurity: 46,
      foreignInfiltrationRisk: 58,
      borderTension: 55,
      publicRetaliationDemand: 40,
      intelligenceUncertainty: 60,
      armyAlertLevel: 45,
    },
    international: {
      caldrisRelations: 48,
      dromirRelations: 45,
      dravicaRelations: 35,
      belvarRelations: 62,
      cyraneRelations: 55,
      internationalReputation: 50,
      tradeAccess: 52,
      diplomaticLeverage: 44,
      foreignAidDependence: 35,
      sanctionsRisk: 20,
    },
    factions: {
      civic_renewal_league: createFactionState({
        support: 48,
        trust: 55,
        fear: 20,
        organization: 58,
        radicalization: 24,
        unity: 52,
        governmentAccess: 55,
        unmetDemandSeverity: 35,
        repressionMemory: 10,
      }),
      national_stewardship_union: createFactionState({
        support: 46,
        trust: 42,
        fear: 25,
        organization: 61,
        radicalization: 30,
        unity: 60,
        governmentAccess: 50,
        unmetDemandSeverity: 42,
        repressionMemory: 8,
      }),
      workers_commonwealth: createFactionState({
        support: 44,
        trust: 38,
        fear: 35,
        organization: 64,
        radicalization: 42,
        unity: 48,
        governmentAccess: 35,
        unmetDemandSeverity: 62,
        repressionMemory: 28,
      }),
    },
    characters: {
      mara_edevane: createCharacterState(),
      lucien_kest: createCharacterState(),
      sabine_orrel: createCharacterState(),
      darek_voln: createCharacterState(),
      ilona_meret: createCharacterState(),
      tomas_veyr: createCharacterState(),
      celia_rovan: createCharacterState(),
      ansel_mire: createCharacterState(),
    },
    relationships: {
      mara_edevane: createRelationshipState(),
      lucien_kest: createRelationshipState(),
      sabine_orrel: createRelationshipState(),
      darek_voln: createRelationshipState(),
      ilona_meret: createRelationshipState(),
      tomas_veyr: createRelationshipState(),
      celia_rovan: createRelationshipState(),
      ansel_mire: createRelationshipState(),
    },
    memories: [],
    regions: {
      orsanne_metropolitan_district: createRegionState({
        approval: 53,
        localEconomy: 56,
        unemploymentBps: 900,
        foodSupply: 52,
        fuelSupply: 48,
        infrastructure: 62,
        securityTension: 42,
        protestIntensity: 44,
        militaryPresence: 25,
        governorTrust: 54,
      }),
      kestrel_industrial_basin: createRegionState({
        approval: 42,
        localEconomy: 43,
        unemploymentBps: 1450,
        foodSupply: 47,
        fuelSupply: 40,
        infrastructure: 48,
        securityTension: 58,
        protestIntensity: 55,
        militaryPresence: 35,
        governorTrust: 40,
      }),
      lydra_agricultural_plain: createRegionState({
        approval: 50,
        localEconomy: 50,
        unemploymentBps: 800,
        foodSupply: 58,
        fuelSupply: 42,
        infrastructure: 44,
        securityTension: 35,
        protestIntensity: 35,
        militaryPresence: 20,
        governorTrust: 52,
      }),
      roven_marches: createRegionState({
        approval: 45,
        localEconomy: 40,
        unemploymentBps: 1200,
        foodSupply: 44,
        fuelSupply: 38,
        infrastructure: 38,
        securityTension: 65,
        protestIntensity: 47,
        militaryPresence: 68,
        governorTrust: 43,
      }),
    },
    family: {
      spouseTrust: 62,
      daughterTrust: 58,
      sonTrust: 57,
      siblingTrust: 60,
      familyPublicReputation: 55,
      spousePublicReputation: 54,
      familyScandalRisk: 25,
      memoryIds: [],
    },
    cabinet: [],
    lawsAndMeasures: [],
    flags: [],
    eventHistory: [],
    pendingEvents: [],
    delayedEffects: [],
    media: [],
    outcomeState: {},
    debugMetadata: {},
  });

  return { authoritativeState, appliedBackground: null };
}
