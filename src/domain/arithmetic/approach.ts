import { clampBigInt } from "./clamp";
import { assertSafeInteger, safeBigIntToNumber } from "./validation";

export function approach(
  current: number,
  target: number,
  maximumStep: number,
): number {
  assertSafeInteger(current, "current");
  assertSafeInteger(target, "target");
  assertSafeInteger(maximumStep, "maximumStep");
  if (maximumStep < 0) {
    throw new RangeError("maximumStep must be non-negative.");
  }

  const currentBigInt = BigInt(current);
  const maximumStepBigInt = BigInt(maximumStep);
  const delta = BigInt(target) - currentBigInt;
  const boundedDelta = clampBigInt(
    delta,
    -maximumStepBigInt,
    maximumStepBigInt,
  );
  return safeBigIntToNumber(currentBigInt + boundedDelta, "approach result");
}
