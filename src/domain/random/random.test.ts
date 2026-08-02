import { describe, expect, it } from "vitest";

import { publicSaveSummarySchema } from "../schemas/save/save-schemas";
import {
  DETERMINISTIC_RANDOM_ALGORITHM_VERSION,
  HIGH_UNCERTAINTY_VARIATION_RANGE,
  ORDINARY_VARIATION_RANGE,
  SEED_SERIALIZATION_VERSION,
  createSeedContext,
  deterministicIntInclusive,
  highUncertaintyVariation,
  ordinaryBoundedVariation,
  seedContextSchema,
  serializeSeedContext,
  type SeedContext,
} from "./index";
import {
  UINT64_MASK,
  fnv1a64,
  splitMix64,
  splitMix64Sample,
  unsigned64ToHex,
} from "./hash";

interface SeedContextInputFixture {
  readonly gameSeed: string;
  readonly namespace: string;
  readonly entityId: string;
  readonly politicalPeriod: number;
  readonly attemptIndex: number;
  readonly contentVersion: string;
}

const BASE_CONTEXT_INPUT: SeedContextInputFixture = {
  gameSeed: "test_seed_value_1983",
  namespace: "scenario_tie_break",
  entityId: "scenario_supply_01",
  politicalPeriod: 2,
  attemptIndex: 0,
  contentVersion: "mvp-0.1.0",
};

const EXPECTED_CANONICAL_CONTEXT =
  "mandate_seed_v1|gameSeed=20:test_seed_value_1983|namespace=18:scenario_tie_break|entityId=18:scenario_supply_01|politicalPeriod=1:2|attemptIndex=1:0|contentVersion=9:mvp-0.1.0";

function baseContext(): SeedContext {
  return createSeedContext(BASE_CONTEXT_INPUT);
}

function contextWith(override: Partial<SeedContextInputFixture>): SeedContext {
  return createSeedContext({ ...BASE_CONTEXT_INPUT, ...override });
}

describe("seed context and canonical serialization", () => {
  it("validates and freezes the strict seed context", () => {
    const context = baseContext();
    expect(seedContextSchema.safeParse(context).success).toBe(true);
    expect(Object.isFrozen(context)).toBe(true);
    expect(
      seedContextSchema.safeParse({ ...BASE_CONTEXT_INPUT, timestamp: 1 })
        .success,
    ).toBe(false);
  });

  it.each([
    [{ namespace: "Invalid Namespace" }],
    [{ entityId: "invalid-entity" }],
    [{ politicalPeriod: 7 }],
    [{ attemptIndex: -1 }],
    [{ attemptIndex: 1.5 }],
    [{ contentVersion: "mvp-next" }],
    [{ gameSeed: "short" }],
  ])("rejects invalid context field %o", (override) => {
    expect(
      seedContextSchema.safeParse({ ...BASE_CONTEXT_INPUT, ...override })
        .success,
    ).toBe(false);
  });

  it("uses the fixed versioned canonical field order", () => {
    expect(serializeSeedContext(baseContext())).toBe(
      EXPECTED_CANONICAL_CONTEXT,
    );
    const reordered = createSeedContext({
      contentVersion: BASE_CONTEXT_INPUT.contentVersion,
      attemptIndex: BASE_CONTEXT_INPUT.attemptIndex,
      politicalPeriod: BASE_CONTEXT_INPUT.politicalPeriod,
      entityId: BASE_CONTEXT_INPUT.entityId,
      namespace: BASE_CONTEXT_INPUT.namespace,
      gameSeed: BASE_CONTEXT_INPUT.gameSeed,
    });
    expect(serializeSeedContext(reordered)).toBe(EXPECTED_CANONICAL_CONTEXT);
  });

  it("prevents ambiguous adjacent-field concatenation", () => {
    const first = contextWith({ namespace: "ab", entityId: "c" });
    const second = contextWith({ namespace: "a", entityId: "bc" });
    expect(`${first.namespace}${first.entityId}`).toBe(
      `${second.namespace}${second.entityId}`,
    );
    expect(serializeSeedContext(first)).not.toBe(serializeSeedContext(second));
  });

  it("changes the deterministic context for every authoritative input", () => {
    const baseHash = fnv1a64(serializeSeedContext(baseContext()));
    const variants = [
      contextWith({ gameSeed: "test_seed_value_1984" }),
      contextWith({ namespace: "scenario_selection" }),
      contextWith({ entityId: "scenario_supply_02" }),
      contextWith({ politicalPeriod: 3 }),
      contextWith({ attemptIndex: 1 }),
      contextWith({ contentVersion: "mvp-0.1.1" }),
    ];
    for (const variant of variants) {
      expect(fnv1a64(serializeSeedContext(variant))).not.toBe(baseHash);
    }
  });
});

describe("stable unsigned 64-bit hashing", () => {
  it.each([
    ["", "cbf29ce484222325"],
    ["a", "af63dc4c8601ec8c"],
    ["foobar", "85944171f73967e8"],
    ["é", "0ac21707b7181e01"],
    ["😀", "feff073875020288"],
  ])("matches the FNV-1a UTF-8 vector for %s", (value, expected) => {
    expect(unsigned64ToHex(fnv1a64(value))).toBe(expected);
  });

  it.each([
    [0n, "e220a8397b1dcdaf"],
    [1n, "910a2dec89025cc1"],
    [UINT64_MASK, "e4d971771b652c20"],
  ])("matches the SplitMix64 vector for %s", (value, expected) => {
    expect(unsigned64ToHex(splitMix64(value))).toBe(expected);
  });

  it("derives stateless samples by stable index", () => {
    expect(splitMix64Sample(0n, 0)).toBe(splitMix64(0n));
    expect(splitMix64Sample(0n, 1)).not.toBe(splitMix64Sample(0n, 0));
    expect(splitMix64Sample(0n, 1)).toBe(splitMix64Sample(0n, 1));
  });

  it("serializes exact unsigned 64-bit boundaries as lowercase hex", () => {
    expect(unsigned64ToHex(0n)).toBe("0000000000000000");
    expect(unsigned64ToHex(UINT64_MASK)).toBe("ffffffffffffffff");
    expect(() => unsigned64ToHex(-1n)).toThrow(RangeError);
    expect(() => unsigned64ToHex(UINT64_MASK + 1n)).toThrow(RangeError);
    expect(() => splitMix64(-1n)).toThrow(RangeError);
  });
});

describe("deterministic inclusive integers", () => {
  it("matches a fixed known-answer fixture", () => {
    const result = deterministicIntInclusive(baseContext(), -2, 2);
    expect(result.value).toBe(-1);
    expect(result.explanation.contextHashHex).toBe("68f39fac955ef590");
    expect(result.explanation.acceptedSampleHex).toBe("35aa3af700181972");
  });

  it("does not reroll repeated calls with the same logical context", () => {
    const first = deterministicIntInclusive(baseContext(), -100, 100, 3);
    const retry = deterministicIntInclusive(baseContext(), -100, 100, 3);
    expect(retry).toEqual(first);
  });

  it("supports negative and single-value ranges", () => {
    const negative = deterministicIntInclusive(baseContext(), -20, -10);
    expect(negative.value).toBeGreaterThanOrEqual(-20);
    expect(negative.value).toBeLessThanOrEqual(-10);
    expect(deterministicIntInclusive(baseContext(), 7, 7).value).toBe(7);
  });

  it("reaches both inclusive bounds through fixed sample indexes", () => {
    const values = Array.from(
      { length: 8 },
      (_unused, sampleIndex) =>
        deterministicIntInclusive(baseContext(), 0, 1, sampleIndex).value,
    );
    expect(values).toContain(0);
    expect(values).toContain(1);
  });

  it("separates streams by context and sample index", () => {
    const base = deterministicIntInclusive(
      baseContext(),
      -4_000_000_000_000_000,
      4_000_000_000_000_000,
      0,
    );
    const variants = [
      deterministicIntInclusive(
        contextWith({ namespace: "scenario_selection" }),
        -4_000_000_000_000_000,
        4_000_000_000_000_000,
        0,
      ),
      deterministicIntInclusive(
        contextWith({ entityId: "scenario_supply_02" }),
        -4_000_000_000_000_000,
        4_000_000_000_000_000,
        0,
      ),
      deterministicIntInclusive(
        contextWith({ politicalPeriod: 3 }),
        -4_000_000_000_000_000,
        4_000_000_000_000_000,
        0,
      ),
      deterministicIntInclusive(
        contextWith({ attemptIndex: 1 }),
        -4_000_000_000_000_000,
        4_000_000_000_000_000,
        0,
      ),
      deterministicIntInclusive(
        contextWith({ contentVersion: "mvp-0.1.1" }),
        -4_000_000_000_000_000,
        4_000_000_000_000_000,
        0,
      ),
      deterministicIntInclusive(
        contextWith({ gameSeed: "test_seed_value_1984" }),
        -4_000_000_000_000_000,
        4_000_000_000_000_000,
        0,
      ),
      deterministicIntInclusive(
        baseContext(),
        -4_000_000_000_000_000,
        4_000_000_000_000_000,
        1,
      ),
    ];
    for (const variant of variants) {
      expect(variant.explanation.acceptedSampleHex).not.toBe(
        base.explanation.acceptedSampleHex,
      );
    }
  });

  it.each([
    [10, 0],
    [0.5, 10],
    [0, 10.5],
    [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  ])("rejects invalid or excessive range %s..%s", (minimum, maximum) => {
    expect(() =>
      deterministicIntInclusive(baseContext(), minimum, maximum),
    ).toThrow(RangeError);
  });

  it.each([-1, 0.5, Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid sample index %s",
    (sampleIndex) => {
      expect(() =>
        deterministicIntInclusive(baseContext(), 0, 10, sampleIndex),
      ).toThrow(RangeError);
    },
  );

  it("executes the deterministic rejection-sampling path", () => {
    const rejectionContext = contextWith({
      gameSeed: "test_seed_0000006062",
    });
    const result = deterministicIntInclusive(rejectionContext, 0, 2 ** 52);
    expect(result.value).toBe(2_078_761_482_140_740);
    expect(result.explanation.contextHashHex).toBe("7f408e0800ab3e45");
    expect(result.explanation.rejectionCount).toBe(1);
    expect(result.explanation.requestedSampleIndex).toBe(0);
    expect(result.explanation.acceptedSampleIndex).toBe(1);
    expect(result.explanation.acceptedSampleHex).toBe("d377629f5fb7497b");
  });

  it("does not mutate the seed context", () => {
    const context = baseContext();
    const before = structuredClone(context);
    deterministicIntInclusive(context, -10, 10, 4);
    expect(context).toEqual(before);
  });
});

describe("bounded variation and developer explanations", () => {
  it("keeps ordinary and high-uncertainty adjustments inside exact ranges", () => {
    for (let sampleIndex = 0; sampleIndex < 64; sampleIndex += 1) {
      const ordinary = ordinaryBoundedVariation(baseContext(), sampleIndex);
      const high = highUncertaintyVariation(baseContext(), sampleIndex);
      expect(ordinary.adjustment).toBeGreaterThanOrEqual(
        ORDINARY_VARIATION_RANGE.minimum,
      );
      expect(ordinary.adjustment).toBeLessThanOrEqual(
        ORDINARY_VARIATION_RANGE.maximum,
      );
      expect(high.adjustment).toBeGreaterThanOrEqual(
        HIGH_UNCERTAINTY_VARIATION_RANGE.minimum,
      );
      expect(high.adjustment).toBeLessThanOrEqual(
        HIGH_UNCERTAINTY_VARIATION_RANGE.maximum,
      );
    }
  });

  it("returns stable developer-only explanation metadata matching the result", () => {
    const variation = ordinaryBoundedVariation(baseContext(), 2);
    expect(variation.explanation.developerOnly).toBe(true);
    expect(variation.explanation.algorithmVersion).toBe(
      DETERMINISTIC_RANDOM_ALGORITHM_VERSION,
    );
    expect(variation.explanation.seedSerializationVersion).toBe(
      SEED_SERIALIZATION_VERSION,
    );
    expect(variation.explanation.canonicalSeedContext).toBe(
      EXPECTED_CANONICAL_CONTEXT,
    );
    expect(variation.explanation.namespace).toBe("scenario_tie_break");
    expect(variation.explanation.entityId).toBe("scenario_supply_01");
    expect(variation.explanation.politicalPeriod).toBe(2);
    expect(variation.explanation.attemptIndex).toBe(0);
    expect(variation.explanation.contentVersion).toBe("mvp-0.1.0");
    expect(variation.explanation.requestedRange).toEqual(
      ORDINARY_VARIATION_RANGE,
    );
    expect(variation.explanation.result).toBe(variation.adjustment);
    expect(variation.explanation.securityClassification).toBe(
      "non_cryptographic_simulation_only",
    );
  });

  it("does not expose explanation metadata through public save summaries", () => {
    const explanation = ordinaryBoundedVariation(baseContext()).explanation;
    expect(
      publicSaveSummarySchema.safeParse({
        saveId: "4cc946fc-22a0-4db1-991f-cf3d93bc11c7",
        saveVersion: "save-1.0.0",
        contentVersion: "mvp-0.1.0",
        schemaVersion: "schema-1.0.0",
        revision: 0,
        politicalPeriod: 0,
        selectedBackground: "civil_service_reformer",
        presidentDisplayName: "President Valère",
        createdAt: "1983-01-01T00:00:00.000Z",
        updatedAt: "1983-01-01T00:00:00.000Z",
        seedExplanation: explanation,
      }).success,
    ).toBe(false);
  });
});
