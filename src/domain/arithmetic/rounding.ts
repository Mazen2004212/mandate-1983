import {
  assertBigInt,
  assertSafeInteger,
  safeBigIntToNumber,
} from "./validation";

export function roundNearestBigInt(
  numerator: bigint,
  denominator: bigint,
): bigint {
  assertBigInt(numerator, "numerator");
  assertBigInt(denominator, "denominator");
  if (denominator <= 0n) {
    throw new RangeError("denominator must be positive.");
  }

  const isNegative = numerator < 0n;
  const absoluteNumerator = isNegative ? -numerator : numerator;
  const quotient = absoluteNumerator / denominator;
  const remainder = absoluteNumerator % denominator;
  const roundedMagnitude =
    remainder * 2n >= denominator ? quotient + 1n : quotient;

  return isNegative ? -roundedMagnitude : roundedMagnitude;
}

export function roundNearest(numerator: number, denominator: number): number {
  assertSafeInteger(numerator, "numerator");
  assertSafeInteger(denominator, "denominator");
  const result = roundNearestBigInt(BigInt(numerator), BigInt(denominator));
  return safeBigIntToNumber(result, "rounded result");
}
