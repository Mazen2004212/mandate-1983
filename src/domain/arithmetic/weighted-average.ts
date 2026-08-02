import { roundNearestBigInt } from "./rounding";
import {
  assertSafeBigInt,
  assertSafeInteger,
  safeBigIntToNumber,
} from "./validation";

export interface WeightedItem {
  readonly value: number;
  readonly weight: number;
}

export function weightedAverage(items: readonly WeightedItem[]): number {
  if (items.length === 0) {
    throw new RangeError("weightedAverage requires at least one item.");
  }

  let weightedTotal = 0n;
  let totalWeight = 0n;

  for (const [index, item] of items.entries()) {
    assertSafeInteger(item.value, `items[${index}].value`);
    assertSafeInteger(item.weight, `items[${index}].weight`);
    if (item.weight <= 0) {
      throw new RangeError(`items[${index}].weight must be positive.`);
    }

    const weightedValue = BigInt(item.value) * BigInt(item.weight);
    assertSafeBigInt(weightedValue, `items[${index}] weighted value`);
    weightedTotal += weightedValue;
    totalWeight += BigInt(item.weight);
    assertSafeBigInt(weightedTotal, "weighted total");
    assertSafeBigInt(totalWeight, "total weight");
  }

  const result = roundNearestBigInt(weightedTotal, totalWeight);
  return safeBigIntToNumber(result, "weighted average result");
}
