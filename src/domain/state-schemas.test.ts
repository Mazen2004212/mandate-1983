import { describe, expect, it } from "vitest";

import {
  delayedEffectRuntimeStateSchema,
  memoryStateSchema,
  rootGameStateSchema,
} from "./index";
import { createValidRootStateFixture } from "./test/fixtures";

const ROOT_DOMAINS = [
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
] as const;

describe("root game state", () => {
  it("accepts a complete valid fixture with every exact root domain", () => {
    const parsed = rootGameStateSchema.parse(createValidRootStateFixture());
    expect(Object.keys(parsed)).toEqual(ROOT_DOMAINS);
  });

  it("accepts empty typed collections without fabricating content", () => {
    const parsed = rootGameStateSchema.parse(createValidRootStateFixture());
    expect(parsed.memories).toEqual([]);
    expect(parsed.cabinet).toEqual([]);
    expect(parsed.lawsAndMeasures).toEqual([]);
    expect(parsed.flags).toEqual([]);
    expect(parsed.eventHistory).toEqual([]);
    expect(parsed.pendingEvents).toEqual([]);
    expect(parsed.delayedEffects).toEqual([]);
    expect(parsed.media).toEqual([]);
  });

  it("rejects missing domains and unknown root fields", () => {
    const missing = structuredClone(createValidRootStateFixture());
    Reflect.deleteProperty(missing, "economy");
    expect(rootGameStateSchema.safeParse(missing).success).toBe(false);
    expect(
      rootGameStateSchema.safeParse({
        ...createValidRootStateFixture(),
        parliament: {},
      }).success,
    ).toBe(false);
  });

  it("rejects unknown nested fields", () => {
    const state = createValidRootStateFixture();
    expect(
      rootGameStateSchema.safeParse({
        ...state,
        government: { ...state.government, inventedAuthority: 50 },
      }).success,
    ).toBe(false);
  });

  const invalidRangeCases: Array<
    [string, (state: ReturnType<typeof createValidRootStateFixture>) => unknown]
  > = [
    [
      "economy normalized",
      (state) => ({
        ...state,
        economy: { ...state.economy, currencyStability: 101 },
      }),
    ],
    [
      "economy inflation",
      (state) => ({
        ...state,
        economy: { ...state.economy, inflationBps: 5001 },
      }),
    ],
    [
      "economy unemployment",
      (state) => ({
        ...state,
        economy: { ...state.economy, unemploymentBps: 4001 },
      }),
    ],
    [
      "economy growth",
      (state) => ({
        ...state,
        economy: { ...state.economy, annualGrowthBps: -1001 },
      }),
    ],
    [
      "government penalty",
      (state) => ({
        ...state,
        government: { ...state.government, activeScandalPenalty: 21 },
      }),
    ],
    [
      "security score",
      (state) => ({
        ...state,
        security: { ...state.security, armyLoyalty: -1 },
      }),
    ],
    [
      "international relation",
      (state) => ({
        ...state,
        international: { ...state.international, dravicaRelations: 101 },
      }),
    ],
    [
      "faction numeric",
      (state) => ({
        ...state,
        factions: {
          ...state.factions,
          civic_renewal_league: {
            ...state.factions.civic_renewal_league,
            trust: 101,
          },
        },
      }),
    ],
    [
      "relationship numeric",
      (state) => ({
        ...state,
        relationships: {
          ...state.relationships,
          mara_edevane: { ...state.relationships.mara_edevane, fear: -1 },
        },
      }),
    ],
    [
      "region unemployment",
      (state) => ({
        ...state,
        regions: {
          ...state.regions,
          roven_marches: {
            ...state.regions.roven_marches,
            unemploymentBps: 4001,
          },
        },
      }),
    ],
    [
      "family trust",
      (state) => ({
        ...state,
        family: { ...state.family, spouseTrust: 101 },
      }),
    ],
  ];

  it.each(invalidRangeCases)("rejects out-of-range %s", (_label, mutate) => {
    expect(
      rootGameStateSchema.safeParse(mutate(createValidRootStateFixture()))
        .success,
    ).toBe(false);
  });
});

describe("memory and delayed-effect state", () => {
  const memory = {
    id: "memory_supply_promise",
    subjectId: "mara_edevane",
    targetId: "president",
    sourceScenarioId: "scenario_supply_01",
    sourceChoiceId: "choice_imports",
    emotionalWeight: -20,
    politicalWeight: 30,
    visibility: "hidden",
    creationPeriod: 1,
    decayRatePerPeriod: 0,
    permanent: true,
    dialogueInfluenceTags: ["promise"],
    eventInfluenceTags: [],
    outcomeInfluenceTags: [],
  };

  it("accepts documented memory fields and rejects invalid decay", () => {
    expect(memoryStateSchema.safeParse(memory).success).toBe(true);
    expect(
      memoryStateSchema.safeParse({ ...memory, decayRatePerPeriod: -1 })
        .success,
    ).toBe(false);
    expect(
      memoryStateSchema.safeParse({ ...memory, decayRatePerPeriod: 1 }).success,
    ).toBe(false);
    expect(
      memoryStateSchema.safeParse({
        ...memory,
        permanent: false,
        decayRatePerPeriod: 10,
      }).success,
    ).toBe(true);
  });

  it("enforces delayed-effect runtime chronology and exact fields", () => {
    const effect = {
      id: "delay_supply_relief",
      sourceScenarioId: "scenario_supply_01",
      sourceChoiceId: "choice_imports",
      creationPeriod: 1,
      triggerPeriod: 2,
      priority: 10,
      effectIds: ["effect_supply_relief"],
      prerequisiteConditionIds: [],
      cancellationConditionIds: [],
      idempotencyKey: "delay_supply_relief_1",
      status: "pending",
    };
    expect(delayedEffectRuntimeStateSchema.safeParse(effect).success).toBe(
      true,
    );
    expect(
      delayedEffectRuntimeStateSchema.safeParse({
        ...effect,
        triggerPeriod: 0,
      }).success,
    ).toBe(false);
    expect(
      delayedEffectRuntimeStateSchema.safeParse({ ...effect, payload: {} })
        .success,
    ).toBe(false);
  });
});
