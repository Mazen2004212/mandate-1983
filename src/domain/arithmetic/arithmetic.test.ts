import { describe, expect, it } from "vitest";

import {
  approach,
  clamp,
  clamp100,
  clampBigInt,
  roundNearest,
  roundNearestBigInt,
  weightedAverage,
} from "./index";

describe("clamp", () => {
  it.each([
    [-5, 0, 10, 0],
    [15, 0, 10, 10],
    [5, 0, 10, 5],
    [0, 0, 10, 0],
    [10, 0, 10, 10],
    [5, 5, 5, 5],
  ])("clamp(%i, %i, %i) returns %i", (value, minimum, maximum, expected) => {
    expect(clamp(value, minimum, maximum)).toBe(expected);
  });

  it("rejects reversed bounds", () => {
    expect(() => clamp(5, 10, 0)).toThrow(RangeError);
    expect(() => clampBigInt(5n, 10n, 0n)).toThrow(RangeError);
  });

  it.each([1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_VALUE])(
    "rejects invalid number input %s",
    (value) => {
      expect(() => clamp(value, 0, 100)).toThrow(RangeError);
      expect(() => clamp(50, value, 100)).toThrow(RangeError);
      expect(() => clamp(50, 0, value)).toThrow(RangeError);
    },
  );

  it("preserves exact bigint values and bounds", () => {
    const huge = 10n ** 100n;
    expect(clampBigInt(-huge, -10n, 10n)).toBe(-10n);
    expect(clampBigInt(huge, -10n, 10n)).toBe(10n);
    expect(clampBigInt(huge, huge, huge)).toBe(huge);
  });

  it("rejects mixed bigint and number runtime inputs", () => {
    expect(() => Reflect.apply(clampBigInt, undefined, [1n, 0, 2n])).toThrow(
      TypeError,
    );
  });
});

describe("clamp100", () => {
  it.each([
    [-1, 0],
    [0, 0],
    [42, 42],
    [100, 100],
    [101, 100],
  ])("clamp100(%i) returns %i", (value, expected) => {
    expect(clamp100(value)).toBe(expected);
  });

  it.each([0.5, Number.NaN, Number.NEGATIVE_INFINITY])(
    "rejects invalid value %s",
    (value) => {
      expect(() => clamp100(value)).toThrow(RangeError);
    },
  );
});

describe("roundNearest", () => {
  it.each([
    [1, 2, 1],
    [-1, 2, -1],
    [3, 2, 2],
    [-3, 2, -2],
    [4, 2, 2],
    [-4, 2, -2],
    [1, 3, 0],
    [-1, 3, 0],
    [2, 3, 1],
    [-2, 3, -1],
    [9, 1, 9],
    [-9, 1, -9],
    [0, 7, 0],
  ])("roundNearest(%i, %i) returns %i", (numerator, denominator, expected) => {
    expect(roundNearest(numerator, denominator)).toBe(expected);
  });

  it.each([0, -1, -10])("rejects denominator %i", (denominator) => {
    expect(() => roundNearest(1, denominator)).toThrow(RangeError);
    expect(() => roundNearestBigInt(1n, BigInt(denominator))).toThrow(
      RangeError,
    );
  });

  it.each([1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid numerator %s",
    (numerator) => {
      expect(() => roundNearest(numerator, 2)).toThrow(RangeError);
    },
  );

  it("rejects unsafe number inputs", () => {
    expect(() => roundNearest(Number.MAX_SAFE_INTEGER + 1, 2)).toThrow(
      RangeError,
    );
    expect(() => roundNearest(1, Number.MAX_SAFE_INTEGER + 1)).toThrow(
      RangeError,
    );
  });

  it("keeps number and bigint implementations equivalent in the safe range", () => {
    const fixtures = [
      [-9_007_199_254_740_991, 7],
      [-101, 8],
      [-1, 2],
      [0, 3],
      [1, 2],
      [101, 8],
      [9_007_199_254_740_991, 7],
    ] as const;
    for (const [numerator, denominator] of fixtures) {
      expect(roundNearest(numerator, denominator)).toBe(
        Number(roundNearestBigInt(BigInt(numerator), BigInt(denominator))),
      );
    }
  });

  it("rounds bigint values beyond the number-safe range exactly", () => {
    const numerator = 10n ** 100n + 5n;
    expect(roundNearestBigInt(numerator, 10n)).toBe(10n ** 99n + 1n);
    expect(roundNearestBigInt(-numerator, 10n)).toBe(-(10n ** 99n) - 1n);
  });
});

describe("weightedAverage", () => {
  it("handles one item", () => {
    expect(weightedAverage([{ value: 42, weight: 3 }])).toBe(42);
  });

  it("handles multiple unequal weights", () => {
    expect(
      weightedAverage([
        { value: 20, weight: 1 },
        { value: 80, weight: 3 },
      ]),
    ).toBe(65);
  });

  it("uses half-away-from-zero rounding for positive and negative totals", () => {
    expect(
      weightedAverage([
        { value: 0, weight: 1 },
        { value: 1, weight: 1 },
      ]),
    ).toBe(1);
    expect(
      weightedAverage([
        { value: 0, weight: 1 },
        { value: -1, weight: 1 },
      ]),
    ).toBe(-1);
  });

  it("does not clamp the caller's unit", () => {
    expect(
      weightedAverage([
        { value: 100, weight: 1 },
        { value: 140, weight: 1 },
      ]),
    ).toBe(120);
  });

  it("rejects empty collections and non-positive weights", () => {
    expect(() => weightedAverage([])).toThrow(RangeError);
    expect(() => weightedAverage([{ value: 10, weight: 0 }])).toThrow(
      RangeError,
    );
    expect(() => weightedAverage([{ value: 10, weight: -1 }])).toThrow(
      RangeError,
    );
  });

  it("rejects fractional values and weights", () => {
    expect(() => weightedAverage([{ value: 1.5, weight: 1 }])).toThrow(
      RangeError,
    );
    expect(() => weightedAverage([{ value: 1, weight: 1.5 }])).toThrow(
      RangeError,
    );
  });

  it("rejects product, running-total, and weight-total overflow", () => {
    expect(() =>
      weightedAverage([{ value: Number.MAX_SAFE_INTEGER, weight: 2 }]),
    ).toThrow(RangeError);
    expect(() =>
      weightedAverage([
        { value: Number.MAX_SAFE_INTEGER, weight: 1 },
        { value: 1, weight: 1 },
      ]),
    ).toThrow(RangeError);
    expect(() =>
      weightedAverage([
        { value: 0, weight: Number.MAX_SAFE_INTEGER },
        { value: 0, weight: 1 },
      ]),
    ).toThrow(RangeError);
  });
});

describe("approach", () => {
  it.each([
    [40, 60, 5, 45],
    [60, 40, 5, 55],
    [58, 60, 5, 60],
    [42, 40, 5, 40],
    [50, 50, 5, 50],
    [50, 80, 0, 50],
  ])(
    "approach(%i, %i, %i) returns %i",
    (current, target, maximumStep, expected) => {
      expect(approach(current, target, maximumStep)).toBe(expected);
    },
  );

  it("never overflows while moving between opposite safe-integer boundaries", () => {
    expect(approach(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 1)).toBe(
      Number.MIN_SAFE_INTEGER + 1,
    );
    expect(approach(Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, 1)).toBe(
      Number.MAX_SAFE_INTEGER - 1,
    );
  });

  it("rejects negative, fractional, and unsafe steps", () => {
    expect(() => approach(0, 10, -1)).toThrow(RangeError);
    expect(() => approach(0, 10, 1.5)).toThrow(RangeError);
    expect(() => approach(0, 10, Number.MAX_SAFE_INTEGER + 1)).toThrow(
      RangeError,
    );
  });

  it("rejects invalid current and target inputs", () => {
    expect(() => approach(Number.NaN, 10, 1)).toThrow(RangeError);
    expect(() => approach(0, Number.POSITIVE_INFINITY, 1)).toThrow(RangeError);
  });
});
