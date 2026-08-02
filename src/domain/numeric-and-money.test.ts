import { describe, expect, it } from "vitest";

import {
  MAX_MONEY_MINOR,
  MIN_MONEY_MINOR,
  basisPointsSchema,
  moneyMinorSchema,
  normalizedScoreSchema,
  parseMoneyMinor,
  politicalPeriodSchema,
  revisionSchema,
  seedValueSchema,
  serializeMoneyMinor,
  serializedMoneyMinorSchema,
  signedWeightSchema,
} from "./index";

describe("canonical numeric schemas", () => {
  it.each([0, 100])("accepts normalized-score boundary %i", (value) => {
    expect(normalizedScoreSchema.safeParse(value).success).toBe(true);
  });

  it.each([-1, 101, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid normalized score %s",
    (value) => {
      expect(normalizedScoreSchema.safeParse(value).success).toBe(false);
    },
  );

  it.each([-100, 0, 100])("accepts signed-weight boundary %i", (value) => {
    expect(signedWeightSchema.safeParse(value).success).toBe(true);
  });

  it.each([-101, 101, -0.5])("rejects invalid signed weight %s", (value) => {
    expect(signedWeightSchema.safeParse(value).success).toBe(false);
  });

  it("keeps basis points integral without inventing a general range", () => {
    expect(basisPointsSchema.safeParse(-12_345).success).toBe(true);
    expect(basisPointsSchema.safeParse(12_345).success).toBe(true);
    expect(basisPointsSchema.safeParse(1.25).success).toBe(false);
  });

  it("enforces revision and political-period bounds", () => {
    expect(revisionSchema.safeParse(0).success).toBe(true);
    expect(revisionSchema.safeParse(Number.MAX_SAFE_INTEGER).success).toBe(
      true,
    );
    expect(revisionSchema.safeParse(-1).success).toBe(false);
    expect(revisionSchema.safeParse(Number.MAX_SAFE_INTEGER + 1).success).toBe(
      false,
    );
    expect(politicalPeriodSchema.safeParse(0).success).toBe(true);
    expect(politicalPeriodSchema.safeParse(6).success).toBe(true);
    expect(politicalPeriodSchema.safeParse(7).success).toBe(false);
  });

  it("accepts only bounded opaque persisted seed values", () => {
    expect(seedValueSchema.safeParse("valid_seed_value_1983").success).toBe(
      true,
    );
    expect(seedValueSchema.safeParse("short").success).toBe(false);
    expect(seedValueSchema.safeParse("unsafe seed value 1983").success).toBe(
      false,
    );
    expect(seedValueSchema.safeParse("x".repeat(129)).success).toBe(false);
  });
});

describe("MoneyMinor", () => {
  it("stores exact signed 64-bit bigint boundary values", () => {
    expect(moneyMinorSchema.parse(0n)).toBe(0n);
    expect(moneyMinorSchema.parse(-123n)).toBe(-123n);
    expect(moneyMinorSchema.parse(MIN_MONEY_MINOR)).toBe(MIN_MONEY_MINOR);
    expect(moneyMinorSchema.parse(MAX_MONEY_MINOR)).toBe(MAX_MONEY_MINOR);
    expect(moneyMinorSchema.safeParse(MIN_MONEY_MINOR - 1n).success).toBe(
      false,
    );
    expect(moneyMinorSchema.safeParse(MAX_MONEY_MINOR + 1n).success).toBe(
      false,
    );
  });

  it.each([1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, "100"])(
    "rejects non-bigint runtime money %s",
    (value) => {
      expect(moneyMinorSchema.safeParse(value).success).toBe(false);
    },
  );

  it("round-trips exact canonical decimal strings", () => {
    const values = [
      "0",
      "1",
      "-1",
      MIN_MONEY_MINOR.toString(),
      MAX_MONEY_MINOR.toString(),
    ];
    for (const value of values) {
      expect(serializeMoneyMinor(parseMoneyMinor(value))).toBe(value);
    }
  });

  it("rejects canonical integer strings outside signed 64-bit storage", () => {
    expect(() => parseMoneyMinor((MAX_MONEY_MINOR + 1n).toString())).toThrow();
    expect(() => parseMoneyMinor((MIN_MONEY_MINOR - 1n).toString())).toThrow();
  });

  it.each(["-0", "+1", "01", "-01", "1.0", "1e3", " 1", ""])(
    "rejects non-canonical serialized money %s",
    (value) => {
      expect(serializedMoneyMinorSchema.safeParse(value).success).toBe(false);
    },
  );
});
