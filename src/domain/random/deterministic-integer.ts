import { assertSafeInteger } from "../arithmetic/validation";
import {
  DETERMINISTIC_RANDOM_ALGORITHM_VERSION,
  UINT64_SIZE,
  fnv1a64,
  splitMix64Sample,
  unsigned64ToHex,
} from "./hash";
import {
  SEED_SERIALIZATION_VERSION,
  seedContextSchema,
  serializeSeedContext,
  type SeedContext,
} from "./seed-context";

const MAX_REJECTION_ATTEMPTS = 128;
const MAX_SAFE_RANGE_SIZE = BigInt(Number.MAX_SAFE_INTEGER);

export interface DeterministicIntegerExplanation {
  readonly developerOnly: true;
  readonly algorithmVersion: typeof DETERMINISTIC_RANDOM_ALGORITHM_VERSION;
  readonly seedSerializationVersion: typeof SEED_SERIALIZATION_VERSION;
  readonly canonicalSeedContext: string;
  readonly namespace: string;
  readonly entityId: string;
  readonly politicalPeriod: number;
  readonly attemptIndex: number;
  readonly contentVersion: string;
  readonly requestedSampleIndex: number;
  readonly acceptedSampleIndex: number;
  readonly requestedRange: Readonly<{
    minimum: number;
    maximum: number;
  }>;
  readonly contextHashHex: string;
  readonly acceptedSampleHex: string;
  readonly rejectionCount: number;
  readonly result: number;
  readonly securityClassification: "non_cryptographic_simulation_only";
}

export interface DeterministicIntegerResult {
  readonly value: number;
  readonly explanation: DeterministicIntegerExplanation;
}

function validateRange(minimum: number, maximum: number): bigint {
  assertSafeInteger(minimum, "minimum");
  assertSafeInteger(maximum, "maximum");
  if (minimum > maximum) {
    throw new RangeError("minimum cannot be greater than maximum.");
  }
  const rangeSize = BigInt(maximum) - BigInt(minimum) + 1n;
  if (rangeSize > MAX_SAFE_RANGE_SIZE) {
    throw new RangeError(
      "requested range exceeds the safe-integer range size.",
    );
  }
  return rangeSize;
}

/**
 * Produces an inclusive deterministic integer without modulo bias. Samples at
 * or above the largest multiple of the range size below 2^64 are rejected.
 * Rejections advance through stable sequential sample indexes. For supported
 * ranges (at most Number.MAX_SAFE_INTEGER values), acceptance probability is
 * greater than 2047/2048; the explicit 128-attempt cap guards corrupted input
 * or future contract changes without introducing mutable state.
 */
export function deterministicIntInclusive(
  context: SeedContext,
  minimum: number,
  maximum: number,
  sampleIndex = 0,
): DeterministicIntegerResult {
  const parsedContext = seedContextSchema.parse(context);
  assertSafeInteger(sampleIndex, "sampleIndex");
  if (sampleIndex < 0) {
    throw new RangeError("sampleIndex must be non-negative.");
  }
  const rangeSize = validateRange(minimum, maximum);
  const canonicalSeedContext = serializeSeedContext(parsedContext);
  const contextHash = fnv1a64(canonicalSeedContext);
  const acceptanceLimit = UINT64_SIZE - (UINT64_SIZE % rangeSize);

  for (
    let rejectionCount = 0;
    rejectionCount < MAX_REJECTION_ATTEMPTS;
    rejectionCount += 1
  ) {
    const currentSampleIndex = sampleIndex + rejectionCount;
    if (!Number.isSafeInteger(currentSampleIndex)) {
      throw new RangeError("rejection sampling exceeded safe sample indexes.");
    }
    const sample = splitMix64Sample(contextHash, currentSampleIndex);
    if (sample < acceptanceLimit) {
      const result = Number(BigInt(minimum) + (sample % rangeSize));
      const requestedRange = Object.freeze({ minimum, maximum });
      const explanation: DeterministicIntegerExplanation = Object.freeze({
        developerOnly: true,
        algorithmVersion: DETERMINISTIC_RANDOM_ALGORITHM_VERSION,
        seedSerializationVersion: SEED_SERIALIZATION_VERSION,
        canonicalSeedContext,
        namespace: parsedContext.namespace,
        entityId: parsedContext.entityId,
        politicalPeriod: parsedContext.politicalPeriod,
        attemptIndex: parsedContext.attemptIndex,
        contentVersion: parsedContext.contentVersion,
        requestedSampleIndex: sampleIndex,
        acceptedSampleIndex: currentSampleIndex,
        requestedRange,
        contextHashHex: unsigned64ToHex(contextHash),
        acceptedSampleHex: unsigned64ToHex(sample),
        rejectionCount,
        result,
        securityClassification: "non_cryptographic_simulation_only",
      });
      return Object.freeze({ value: result, explanation });
    }
  }

  throw new RangeError(
    `rejection sampling exceeded ${MAX_REJECTION_ATTEMPTS} attempts.`,
  );
}
