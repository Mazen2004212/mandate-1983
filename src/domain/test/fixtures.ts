const familyIdentityFixture = {
  surname: "Valère",
  president: {
    role: "president" as const,
    firstName: "Éloïse",
    lastName: "Valère",
    portraitPresetId: "portrait_president_one",
    publicNamePreference: "title_and_last_name" as const,
  },
  spouse: {
    role: "spouse" as const,
    firstName: "Nadia",
    lastName: "Valère",
    portraitPresetId: "portrait_spouse_one",
  },
  adultDaughter: {
    role: "adult_daughter" as const,
    firstName: "Ana-María",
    lastName: "Valère",
    portraitPresetId: "portrait_daughter_one",
  },
  adultSon: {
    role: "adult_son" as const,
    firstName: "O'Rian",
    lastName: "Valère",
    portraitPresetId: "portrait_son_one",
  },
  adultSibling: {
    role: "adult_sibling" as const,
    firstName: "Jean Luc",
    lastName: "Valère",
    portraitPresetId: "portrait_sibling_one",
  },
};

function createFactionFixture() {
  return {
    support: 50,
    trust: 50,
    fear: 20,
    organization: 50,
    mobilization: 40,
    radicalization: 30,
    unity: 50,
    governmentAccess: 45,
    unmetDemandSeverity: 35,
    repressionMemory: 10,
    redLineViolations: [],
    memoryIds: [],
    regionalInfluence: {
      orsanne_metropolitan_district: 50,
      kestrel_industrial_basin: 50,
      lydra_agricultural_plain: 50,
      roven_marches: 50,
    },
  };
}

function createRelationshipFixture() {
  return {
    trust: 50,
    respect: 50,
    fear: 20,
    ideologicalAlignment: 50,
    personalLeverage: 10,
    publicRelationship: 50,
    privateRelationship: 50,
    temporaryMemoryIds: [],
    permanentMemoryIds: [],
  };
}

function createRegionFixture() {
  return {
    approval: 50,
    localEconomy: 50,
    unemploymentBps: 900,
    foodSupply: 50,
    fuelSupply: 50,
    infrastructure: 50,
    securityTension: 40,
    protestIntensity: 40,
    militaryPresence: 30,
    dominantFactionInfluences: {
      civic_renewal_league: 50,
      national_stewardship_union: 50,
      workers_commonwealth: 50,
    },
    activeProjectIds: [],
    activeCrisisIds: [],
    governorTrust: 50,
  };
}

function createCharacterFixture() {
  return { availability: "active" as const, memoryIds: [] };
}

export function createValidFamilyIdentityFixture() {
  return structuredClone(familyIdentityFixture);
}

export function createValidRootStateFixture() {
  const familyIdentity = createValidFamilyIdentityFixture();
  return {
    metadata: { difficulty: "standard" as const },
    identity: {
      selectedBackground: "civil_service_reformer" as const,
      familyIdentity,
    },
    timeline: { politicalPeriod: 0 },
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
      armyAlertLevel: 45,
      policeLoyalty: 53,
      intelligenceLoyalty: 51,
      presidentialGuardLoyalty: 65,
      borderSecurity: 46,
      foreignInfiltrationRisk: 58,
      borderTension: 55,
      publicRetaliationDemand: 40,
      intelligenceUncertainty: 60,
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
      civic_renewal_league: createFactionFixture(),
      national_stewardship_union: createFactionFixture(),
      workers_commonwealth: createFactionFixture(),
    },
    characters: {
      mara_edevane: createCharacterFixture(),
      lucien_kest: createCharacterFixture(),
      sabine_orrel: createCharacterFixture(),
      darek_voln: createCharacterFixture(),
      ilona_meret: createCharacterFixture(),
      tomas_veyr: createCharacterFixture(),
      celia_rovan: createCharacterFixture(),
      ansel_mire: createCharacterFixture(),
    },
    relationships: {
      mara_edevane: createRelationshipFixture(),
      lucien_kest: createRelationshipFixture(),
      sabine_orrel: createRelationshipFixture(),
      darek_voln: createRelationshipFixture(),
      ilona_meret: createRelationshipFixture(),
      tomas_veyr: createRelationshipFixture(),
      celia_rovan: createRelationshipFixture(),
      ansel_mire: createRelationshipFixture(),
    },
    memories: [],
    regions: {
      orsanne_metropolitan_district: createRegionFixture(),
      kestrel_industrial_basin: createRegionFixture(),
      lydra_agricultural_plain: createRegionFixture(),
      roven_marches: createRegionFixture(),
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
  };
}

export function createValidSaveFixture() {
  const authoritativeState = createValidRootStateFixture();
  return {
    saveId: "4cc946fc-22a0-4db1-991f-cf3d93bc11c7",
    ownerId: "cff44bfa-f366-426a-b2b8-1b54f1ad2de3",
    saveVersion: "save-1.0.0",
    contentVersion: "mvp-0.1.0",
    schemaVersion: "schema-1.0.0",
    revision: 0,
    gameSeed: "test_seed_value_1983",
    politicalPeriod: 0,
    createdAt: "1983-01-01T00:00:00.000Z",
    updatedAt: "1983-01-01T00:00:00.000Z",
    selectedBackground: "civil_service_reformer" as const,
    familyIdentity: structuredClone(authoritativeState.identity.familyIdentity),
    authoritativeState,
  };
}
