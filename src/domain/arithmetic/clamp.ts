import { assertBigInt, assertSafeInteger } from "./validation";

export function clamp(value: number, minimum: number, maximum: number): number {
  assertSafeInteger(value, "value");
  assertSafeInteger(minimum, "minimum");
  assertSafeInteger(maximum, "maximum");
  if (minimum > maximum) {
    throw new RangeError("minimum cannot be greater than maximum.");
  }
  if (value < minimum) {
    return minimum;
  }
  if (value > maximum) {
    return maximum;
  }
  return value;
}

export function clampBigInt(
  value: bigint,
  minimum: bigint,
  maximum: bigint,
): bigint {
  assertBigInt(value, "value");
  assertBigInt(minimum, "minimum");
  assertBigInt(maximum, "maximum");
  if (minimum > maximum) {
    throw new RangeError("minimum cannot be greater than maximum.");
  }
  if (value < minimum) {
    return minimum;
  }
  if (value > maximum) {
    return maximum;
  }
  return value;
}

export function clamp100(value: number): number {
  return clamp(value, 0, 100);
}
