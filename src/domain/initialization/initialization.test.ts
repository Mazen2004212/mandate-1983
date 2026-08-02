import { describe, expect, it } from "vitest";

import {
  CANONICAL_CHARACTER_IDS,
  CANONICAL_FACTION_IDS,
  CANONICAL_REGION_IDS,
} from "../constants/canonical-ids";
import { POLITICAL_BACKGROUND_IDS } from "../constants/classifications";
import { flagIdSchema, memoryIdSchema } from "../ids/identifier-schemas";
import { politicalBackgroundIdSchema } from "../schemas/common/classifications";
import { familyNameSchema } from "../schemas/common/family-identity";
import { normalizedScoreSchema } from "../schemas/common/numeric";
import { authoritativeSaveSchema } from "../schemas/save/save-schemas";
import { rootGameStateSchema } from "../schemas/state/root-state";
import { createValidFamilyIdentityFixture } from "../test/fixtures";
import { applyPoliticalBackground } from "./apply-background";
import {
  INITIAL_POLITICAL_PERIOD,
  INITIAL_REVISION,
  INITIAL_SAVE_VERSION,
  INITIAL_SCHEMA_VERSION,
} from "./constants";
import { createNewGame, newGameInputSchema } from "./create-new-game";
import { DuplicatePoliticalBackgroundError } from "./initialization-errors";
import { createInitialStateDraft } from "./initial-state";
import { POLITICAL_BACKGROUND_DEFINITIONS } from "./political-backgrounds";

const FIXED_SAVE_ID = "4cc946fc-22a0-4db1-991f-cf3d93bc11c7";
const FIXED_OWNER_ID = "cff44bfa-f366-426a-b2b8-1b54f1ad2de3";
const FIXED_CREATED_AT = "1983-01-01T00:00:00.000Z";
const FIXED_SEED = "task_05_seed_value_1983";

function createInput(
  selectedBackground: (typeof POLITICAL_BACKGROUND_IDS)[number] = "civil_service_reformer",
) {
  return {
    saveId: FIXED_SAVE_ID,
    ownerId: FIXED_OWNER_ID,
    saveVersion: "save-1.0.0",
    contentVersion: "mvp-0.1.0",
    schemaVersion: "schema-1.0.0",
    gameSeed: FIXED_SEED,
    selectedBackground,
    familyIdentity: createValidFamilyIdentityFixture(),
    createdAt: FIXED_CREATED_AT,
    updatedAt: FIXED_CREATED_AT,
  };
}

function createBaseline(
  selectedBackground: (typeof POLITICAL_BACKGROUND_IDS)[number] = "civil_service_reformer",
) {
  const parsedInput = newGameInputSchema.parse(createInput(selectedBackground));
  return createInitialStateDraft({
    selectedBackground: parsedInput.selectedBackground,
    familyIdentity: parsedInput.familyIdentity,
  }).authoritativeState;
}

function createExpectedFinalState(
  selectedBackground: (typeof POLITICAL_BACKGROUND_IDS)[number],
) {
  const state = createBaseline(selectedBackground);
  switch (selectedBackground) {
    case "civil_service_reformer":
      state.government.civilServiceEfficiency = normalizedScoreSchema.parse(63);
      state.government.constitutionalCompliance =
        normalizedScoreSchema.parse(71);
      state.factions.civic_renewal_league.trust =
        normalizedScoreSchema.parse(60);
      state.factions.national_stewardship_union.trust =
        normalizedScoreSchema.parse(40);
      break;
    case "provincial_governor":
      state.regions.lydra_agricultural_plain.approval =
        normalizedScoreSchema.parse(54);
      state.regions.roven_marches.approval = normalizedScoreSchema.parse(49);
      state.regions.orsanne_metropolitan_district.governorTrust =
        normalizedScoreSchema.parse(57);
      state.regions.kestrel_industrial_basin.governorTrust =
        normalizedScoreSchema.parse(43);
      state.regions.lydra_agricultural_plain.governorTrust =
        normalizedScoreSchema.parse(55);
      state.regions.roven_marches.governorTrust =
        normalizedScoreSchema.parse(46);
      state.factions.national_stewardship_union.trust =
        normalizedScoreSchema.parse(45);
      state.regions.orsanne_metropolitan_district.approval =
        normalizedScoreSchema.parse(51);
      break;
    case "labor_mediator":
      state.factions.workers_commonwealth.trust =
        normalizedScoreSchema.parse(44);
      state.regions.kestrel_industrial_basin.approval =
        normalizedScoreSchema.parse(46);
      state.government.cabinetUnity = normalizedScoreSchema.parse(58);
      state.economy.investorConfidence = normalizedScoreSchema.parse(35);
      break;
    case "security_committee_chair":
      state.security.armyLoyalty = normalizedScoreSchema.parse(62);
      state.security.policeLoyalty = normalizedScoreSchema.parse(56);
      state.security.borderSecurity = normalizedScoreSchema.parse(51);
      state.factions.national_stewardship_union.trust =
        normalizedScoreSchema.parse(46);
      state.factions.civic_renewal_league.trust =
        normalizedScoreSchema.parse(52);
      break;
  }
  return state;
}

describe("the authoritative provisional MVP baseline", () => {
  it("validates and contains every root domain", () => {
    const state = createBaseline();
    expect(rootGameStateSchema.safeParse(state).success).toBe(true);
    expect(Object.keys(state)).toEqual([
      "metadata",
      "identity",
      "timeline",
      "national",
      "economy",
      "government",
      "security",
      "international",
      "factions",
      "characters",
      "relationships",
      "memories",
      "regions",
      "family",
      "cabinet",
      "lawsAndMeasures",
      "flags",
      "eventHistory",
      "pendingEvents",
      "delayedEffects",
      "media",
      "outcomeState",
      "debugMetadata",
    ]);
  });

  it("matches every documented national baseline value and unit", () => {
    const state = createBaseline();
    expect(state.economy).toEqual({
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
    });
    expect(state.government).toEqual({
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
    });
    expect(state.security).toEqual({
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
    });
    expect(state.international).toEqual({
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
    });
  });

  it("matches all canonical faction values and omitted-field decisions", () => {
    const factions = createBaseline().factions;
    expect(Object.keys(factions)).toEqual(CANONICAL_FACTION_IDS);
    expect(factions).toEqual({
      civic_renewal_league: {
        support: 48,
        trust: 55,
        fear: 20,
        organization: 58,
        mobilization: 0,
        radicalization: 24,
        unity: 52,
        governmentAccess: 55,
        unmetDemandSeverity: 35,
        repressionMemory: 10,
        redLineViolations: [],
        memoryIds: [],
        regionalInfluence: {
          orsanne_metropolitan_district: 0,
          kestrel_industrial_basin: 0,
          lydra_agricultural_plain: 0,
          roven_marches: 0,
        },
      },
      national_stewardship_union: {
        support: 46,
        trust: 42,
        fear: 25,
        organization: 61,
        mobilization: 0,
        radicalization: 30,
        unity: 60,
        governmentAccess: 50,
        unmetDemandSeverity: 42,
        repressionMemory: 8,
        redLineViolations: [],
        memoryIds: [],
        regionalInfluence: {
          orsanne_metropolitan_district: 0,
          kestrel_industrial_basin: 0,
          lydra_agricultural_plain: 0,
          roven_marches: 0,
        },
      },
      workers_commonwealth: {
        support: 44,
        trust: 38,
        fear: 35,
        organization: 64,
        mobilization: 0,
        radicalization: 42,
        unity: 48,
        governmentAccess: 35,
        unmetDemandSeverity: 62,
        repressionMemory: 28,
        redLineViolations: [],
        memoryIds: [],
        regionalInfluence: {
          orsanne_metropolitan_district: 0,
          kestrel_industrial_basin: 0,
          lydra_agricultural_plain: 0,
          roven_marches: 0,
        },
      },
    });
  });

  it("initializes every canonical character and relationship", () => {
    const state = createBaseline();
    expect(Object.keys(state.characters)).toEqual(CANONICAL_CHARACTER_IDS);
    expect(Object.keys(state.relationships)).toEqual(CANONICAL_CHARACTER_IDS);
    for (const characterId of CANONICAL_CHARACTER_IDS) {
      expect(state.characters[characterId]).toEqual({
        availability: "active",
        memoryIds: [],
      });
      expect(state.relationships[characterId]).toEqual({
        trust: 50,
        respect: 50,
        fear: 0,
        ideologicalAlignment: 0,
        personalLeverage: 0,
        publicRelationship: 50,
        privateRelationship: 50,
        temporaryMemoryIds: [],
        permanentMemoryIds: [],
      });
      expect(state.relationships[characterId]).not.toHaveProperty("affection");
    }
  });

  it("matches every canonical regional baseline", () => {
    const regions = createBaseline().regions;
    expect(Object.keys(regions)).toEqual(CANONICAL_REGION_IDS);
    expect(regions).toEqual({
      orsanne_metropolitan_district: {
        approval: 53,
        localEconomy: 56,
        unemploymentBps: 900,
        foodSupply: 52,
        fuelSupply: 48,
        infrastructure: 62,
        securityTension: 42,
        protestIntensity: 44,
        militaryPresence: 25,
        dominantFactionInfluences: {
          civic_renewal_league: 0,
          national_stewardship_union: 0,
          workers_commonwealth: 0,
        },
        activeProjectIds: [],
        activeCrisisIds: [],
        governorTrust: 54,
      },
      kestrel_industrial_basin: {
        approval: 42,
        localEconomy: 43,
        unemploymentBps: 1450,
        foodSupply: 47,
        fuelSupply: 40,
        infrastructure: 48,
        securityTension: 58,
        protestIntensity: 55,
        militaryPresence: 35,
        dominantFactionInfluences: {
          civic_renewal_league: 0,
          national_stewardship_union: 0,
          workers_commonwealth: 0,
        },
        activeProjectIds: [],
        activeCrisisIds: [],
        governorTrust: 40,
      },
      lydra_agricultural_plain: {
        approval: 50,
        localEconomy: 50,
        unemploymentBps: 800,
        foodSupply: 58,
        fuelSupply: 42,
        infrastructure: 44,
        securityTension: 35,
        protestIntensity: 35,
        militaryPresence: 20,
        dominantFactionInfluences: {
          civic_renewal_league: 0,
          national_stewardship_union: 0,
          workers_commonwealth: 0,
        },
        activeProjectIds: [],
        activeCrisisIds: [],
        governorTrust: 52,
      },
      roven_marches: {
        approval: 45,
        localEconomy: 40,
        unemploymentBps: 1200,
        foodSupply: 44,
        fuelSupply: 38,
        infrastructure: 38,
        securityTension: 65,
        protestIntensity: 47,
        militaryPresence: 68,
        dominantFactionInfluences: {
          civic_renewal_league: 0,
          national_stewardship_union: 0,
          workers_commonwealth: 0,
        },
        activeProjectIds: [],
        activeCrisisIds: [],
        governorTrust: 43,
      },
    });
  });

  it("matches family values and every documented empty collection", () => {
    const state = createBaseline();
    expect(state.family).toEqual({
      spouseTrust: 62,
      daughterTrust: 58,
      sonTrust: 57,
      siblingTrust: 60,
      familyPublicReputation: 55,
      spousePublicReputation: 54,
      familyScandalRisk: 25,
      memoryIds: [],
    });
    expect({
      national: state.national,
      memories: state.memories,
      cabinet: state.cabinet,
      lawsAndMeasures: state.lawsAndMeasures,
      flags: state.flags,
      eventHistory: state.eventHistory,
      pendingEvents: state.pendingEvents,
      delayedEffects: state.delayedEffects,
      media: state.media,
      outcomeState: state.outcomeState,
      debugMetadata: state.debugMetadata,
    }).toEqual({
      national: {},
      memories: [],
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
  });

  it("returns independent state graphs on separate calls", () => {
    const first = createBaseline();
    first.flags.push(flagIdSchema.parse("test_mutation"));
    first.factions.civic_renewal_league.memoryIds.push(
      memoryIdSchema.parse("test_memory"),
    );

    const second = createBaseline();
    expect(second.flags).toEqual([]);
    expect(second.factions.civic_renewal_league.memoryIds).toEqual([]);
  });
});

describe("political background definitions and application", () => {
  it("contains the exact canonical immutable definitions", () => {
    expect(Object.keys(POLITICAL_BACKGROUND_DEFINITIONS)).toEqual(
      POLITICAL_BACKGROUND_IDS,
    );
    expect(POLITICAL_BACKGROUND_DEFINITIONS).toEqual({
      civil_service_reformer: {
        id: "civil_service_reformer",
        modifiers: [
          { target: "government.civilServiceEfficiency", delta: 5 },
          { target: "government.constitutionalCompliance", delta: 3 },
          { target: "factions.civic_renewal_league.trust", delta: 5 },
          { target: "factions.national_stewardship_union.trust", delta: -2 },
        ],
      },
      provincial_governor: {
        id: "provincial_governor",
        modifiers: [
          { target: "regions.lydra_agricultural_plain.approval", delta: 4 },
          { target: "regions.roven_marches.approval", delta: 4 },
          {
            target: "regions.orsanne_metropolitan_district.governorTrust",
            delta: 3,
          },
          {
            target: "regions.kestrel_industrial_basin.governorTrust",
            delta: 3,
          },
          {
            target: "regions.lydra_agricultural_plain.governorTrust",
            delta: 3,
          },
          { target: "regions.roven_marches.governorTrust", delta: 3 },
          { target: "factions.national_stewardship_union.trust", delta: 3 },
          {
            target: "regions.orsanne_metropolitan_district.approval",
            delta: -2,
          },
        ],
      },
      labor_mediator: {
        id: "labor_mediator",
        modifiers: [
          { target: "factions.workers_commonwealth.trust", delta: 6 },
          { target: "regions.kestrel_industrial_basin.approval", delta: 4 },
          { target: "government.cabinetUnity", delta: 3 },
          { target: "economy.investorConfidence", delta: -3 },
        ],
      },
      security_committee_chair: {
        id: "security_committee_chair",
        modifiers: [
          { target: "security.armyLoyalty", delta: 4 },
          { target: "security.policeLoyalty", delta: 3 },
          { target: "security.borderSecurity", delta: 5 },
          { target: "factions.national_stewardship_union.trust", delta: 4 },
          { target: "factions.civic_renewal_league.trust", delta: -3 },
        ],
      },
    });
    expect(Object.isFrozen(POLITICAL_BACKGROUND_DEFINITIONS)).toBe(true);
    for (const definition of Object.values(POLITICAL_BACKGROUND_DEFINITIONS)) {
      expect(Object.isFrozen(definition)).toBe(true);
      expect(Object.isFrozen(definition.modifiers)).toBe(true);
      expect(definition.modifiers.every(Object.isFrozen)).toBe(true);
    }
  });

  it.each(POLITICAL_BACKGROUND_IDS)(
    "%s has a stable valid ID and a unique non-empty trade-off set",
    (backgroundId) => {
      const definition = POLITICAL_BACKGROUND_DEFINITIONS[backgroundId];
      expect(politicalBackgroundIdSchema.parse(definition.id)).toBe(
        backgroundId,
      );
      expect(definition.modifiers.length).toBeGreaterThan(0);
      expect(definition.modifiers.some(({ delta }) => delta > 0)).toBe(true);
      expect(definition.modifiers.some(({ delta }) => delta < 0)).toBe(true);
      const signatures = POLITICAL_BACKGROUND_IDS.map((id) =>
        JSON.stringify(POLITICAL_BACKGROUND_DEFINITIONS[id].modifiers),
      );
      expect(new Set(signatures).size).toBe(POLITICAL_BACKGROUND_IDS.length);
    },
  );

  it.each(POLITICAL_BACKGROUND_IDS)(
    "applies only the documented %s fields and produces exact final values",
    (backgroundId) => {
      const result = createNewGame(createInput(backgroundId));
      expect(result.authoritativeState).toEqual(
        createExpectedFinalState(backgroundId),
      );
      expect(authoritativeSaveSchema.safeParse(result).success).toBe(true);
      expect(result.selectedBackground).toBe(backgroundId);
      expect(result.authoritativeState.identity.selectedBackground).toBe(
        backgroundId,
      );
      expect(result.familyIdentity).toEqual(createInput().familyIdentity);
      expect(result.gameSeed).toBe(FIXED_SEED);
      expect(result.saveVersion).toBe("save-1.0.0");
      expect(result.schemaVersion).toBe("schema-1.0.0");
      expect(result.contentVersion).toBe("mvp-0.1.0");
    },
  );

  it("clamps positive and negative normalized-score modifiers", () => {
    const highDraft = createInitialStateDraft({
      selectedBackground: politicalBackgroundIdSchema.parse(
        "civil_service_reformer",
      ),
      familyIdentity: newGameInputSchema.parse(createInput()).familyIdentity,
    });
    const highState = rootGameStateSchema.parse({
      ...highDraft.authoritativeState,
      government: {
        ...highDraft.authoritativeState.government,
        civilServiceEfficiency: 99,
      },
    });
    const highResult = applyPoliticalBackground(
      { authoritativeState: highState, appliedBackground: null },
      politicalBackgroundIdSchema.parse("civil_service_reformer"),
    );
    expect(
      highResult.authoritativeState.government.civilServiceEfficiency,
    ).toBe(100);

    const lowDraft = createInitialStateDraft({
      selectedBackground: politicalBackgroundIdSchema.parse("labor_mediator"),
      familyIdentity: newGameInputSchema.parse(createInput()).familyIdentity,
    });
    const lowState = rootGameStateSchema.parse({
      ...lowDraft.authoritativeState,
      economy: {
        ...lowDraft.authoritativeState.economy,
        investorConfidence: 2,
      },
    });
    const lowResult = applyPoliticalBackground(
      { authoritativeState: lowState, appliedBackground: null },
      politicalBackgroundIdSchema.parse("labor_mediator"),
    );
    expect(lowResult.authoritativeState.economy.investorConfidence).toBe(0);
  });

  it("rejects duplicate application without hidden process state", () => {
    const backgroundId = politicalBackgroundIdSchema.parse("labor_mediator");
    const draft = createInitialStateDraft({
      selectedBackground: backgroundId,
      familyIdentity: newGameInputSchema.parse(createInput()).familyIdentity,
    });
    const applied = applyPoliticalBackground(draft, backgroundId);
    expect(() => applyPoliticalBackground(applied, backgroundId)).toThrow(
      DuplicatePoliticalBackgroundError,
    );

    const retryDraft = createInitialStateDraft({
      selectedBackground: backgroundId,
      familyIdentity: newGameInputSchema.parse(createInput()).familyIdentity,
    });
    expect(applyPoliticalBackground(retryDraft, backgroundId)).toEqual(applied);
  });

  it("rejects applying a background other than the selected one", () => {
    const draft = createInitialStateDraft({
      selectedBackground: politicalBackgroundIdSchema.parse("labor_mediator"),
      familyIdentity: newGameInputSchema.parse(createInput()).familyIdentity,
    });
    expect(() =>
      applyPoliticalBackground(
        draft,
        politicalBackgroundIdSchema.parse("civil_service_reformer"),
      ),
    ).toThrow(/must match the selected background/);
  });
});

describe("deterministic new-game creation", () => {
  it("produces a strict valid save with exact fixed metadata", () => {
    const result = createNewGame(createInput());
    expect(authoritativeSaveSchema.safeParse(result).success).toBe(true);
    expect(result.revision).toBe(INITIAL_REVISION);
    expect(result.politicalPeriod).toBe(INITIAL_POLITICAL_PERIOD);
    expect(result.authoritativeState.timeline.politicalPeriod).toBe(0);
    expect(result.authoritativeState.metadata.difficulty).toBe("standard");
    expect(result.saveVersion).toBe(INITIAL_SAVE_VERSION);
    expect(result.schemaVersion).toBe(INITIAL_SCHEMA_VERSION);
    expect(result.contentVersion).toBe("mvp-0.1.0");
    expect(result.createdAt).toBe(FIXED_CREATED_AT);
    expect(result.updatedAt).toBe(FIXED_CREATED_AT);
  });

  it("returns deeply equal output for identical complete input and retry", () => {
    expect(createNewGame(createInput())).toEqual(createNewGame(createInput()));
  });

  it("returns independent authoritative saves on separate calls", () => {
    const first = createNewGame(createInput());
    first.authoritativeState.flags.push(flagIdSchema.parse("changed_save"));
    first.familyIdentity.president.firstName =
      familyNameSchema.parse("Changed");

    const second = createNewGame(createInput());
    expect(second.authoritativeState.flags).toEqual([]);
    expect(second.familyIdentity.president.firstName).not.toBe("Changed");
  });

  it("stores different seeds without varying the fixed initialized state", () => {
    const first = createNewGame(createInput());
    const second = createNewGame({
      ...createInput(),
      gameSeed: "different_seed_value_1983",
    });
    expect(first.gameSeed).toBe(FIXED_SEED);
    expect(second.gameSeed).toBe("different_seed_value_1983");
    expect(first.authoritativeState).toEqual(second.authoritativeState);
  });

  it("does not expose an initialization marker in the save or public input", () => {
    const result = createNewGame(createInput());
    expect(result).not.toHaveProperty("appliedBackground");
    expect(result.authoritativeState).not.toHaveProperty("appliedBackground");
    expect(
      newGameInputSchema.safeParse({
        ...createInput(),
        appliedBackground: "civil_service_reformer",
      }).success,
    ).toBe(false);
  });
});

describe("new-game input validation", () => {
  it.each([
    ["invalid save ID", { saveId: "not-a-save-id" }],
    ["invalid owner ID", { ownerId: "not-an-owner-id" }],
    ["invalid seed", { gameSeed: "short" }],
    ["unsupported background", { selectedBackground: "unknown_background" }],
    ["invalid timestamp", { createdAt: "1983-01-01" }],
    ["unsupported save version", { saveVersion: "save-2.0.0" }],
    ["unsupported schema version", { schemaVersion: "schema-2.0.0" }],
    ["unsupported content version", { contentVersion: "mvp-0.2.0" }],
  ])("rejects %s", (_label, override) => {
    expect(
      newGameInputSchema.safeParse({ ...createInput(), ...override }).success,
    ).toBe(false);
  });

  it("rejects malformed family identity", () => {
    const familyIdentity = createValidFamilyIdentityFixture();
    familyIdentity.president.firstName = "";
    expect(
      newGameInputSchema.safeParse({ ...createInput(), familyIdentity })
        .success,
    ).toBe(false);
  });

  it("rejects an update timestamp before creation", () => {
    expect(
      newGameInputSchema.safeParse({
        ...createInput(),
        updatedAt: "1982-12-31T23:59:59.999Z",
      }).success,
    ).toBe(false);
  });

  it("rejects unknown properties and caller-supplied state", () => {
    expect(
      newGameInputSchema.safeParse({ ...createInput(), unknown: true }).success,
    ).toBe(false);
    expect(
      newGameInputSchema.safeParse({
        ...createInput(),
        authoritativeState: createBaseline(),
      }).success,
    ).toBe(false);
  });

  it("requires exactly one scalar selected background", () => {
    expect(
      newGameInputSchema.safeParse({
        ...createInput(),
        selectedBackground: ["labor_mediator", "provincial_governor"],
      }).success,
    ).toBe(false);
  });
});
