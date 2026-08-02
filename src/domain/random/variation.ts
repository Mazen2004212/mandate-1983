import {
  deterministicIntInclusive,
  type DeterministicIntegerExplanation,
} from "./deterministic-integer";
import type { SeedContext } from "./seed-context";

export const ORDINARY_VARIATION_RANGE = Object.freeze({
  minimum: -2,
  maximum: 2,
});

export const HIGH_UNCERTAINTY_VARIATION_RANGE = Object.freeze({
  minimum: -4,
  maximum: 4,
});

export interface VariationResult {
  readonly adjustment: number;
  readonly explanation: DeterministicIntegerExplanation;
}

function variationForRange(
  context: SeedContext,
  minimum: number,
  maximum: number,
  sampleIndex: number,
): VariationResult {
  const result = deterministicIntInclusive(
    context,
    minimum,
    maximum,
    sampleIndex,
  );
  return Object.freeze({
    adjustment: result.value,
    explanation: result.explanation,
  });
}

export function ordinaryBoundedVariation(
  context: SeedContext,
  sampleIndex = 0,
): VariationResult {
  return variationForRange(
    context,
    ORDINARY_VARIATION_RANGE.minimum,
    ORDINARY_VARIATION_RANGE.maximum,
    sampleIndex,
  );
}

export function highUncertaintyVariation(
  context: SeedContext,
  sampleIndex = 0,
): VariationResult {
  return variationForRange(
    context,
    HIGH_UNCERTAINTY_VARIATION_RANGE.minimum,
    HIGH_UNCERTAINTY_VARIATION_RANGE.maximum,
    sampleIndex,
  );
}
