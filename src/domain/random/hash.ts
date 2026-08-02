import { encodeUtf8 } from "./utf8";

export const UINT64_MASK = 0xffff_ffff_ffff_ffffn;
export const UINT64_SIZE = 0x1_0000_0000_0000_0000n;
export const FNV1A_64_OFFSET_BASIS = 14_695_981_039_346_656_037n;
export const FNV1A_64_PRIME = 1_099_511_628_211n;
export const SPLITMIX64_GAMMA = 0x9e37_79b9_7f4a_7c15n;

const SPLITMIX64_MULTIPLIER_ONE = 0xbf58_476d_1ce4_e5b9n;
const SPLITMIX64_MULTIPLIER_TWO = 0x94d0_49bb_1331_11ebn;

export const DETERMINISTIC_RANDOM_ALGORITHM_VERSION =
  "mandate_rng_v1_fnv1a64_utf8_splitmix64" as const;

function assertUnsigned64(value: bigint, label: string): void {
  if (typeof value !== "bigint" || value < 0n || value > UINT64_MASK) {
    throw new RangeError(`${label} must be an unsigned 64-bit bigint.`);
  }
}

/**
 * FNV-1a 64-bit over the self-contained UTF-8 encoding in utf8.ts. The hash is
 * stable and non-cryptographic; it is suitable only for deterministic game
 * simulation. Multiplication is masked to unsigned 64 bits after every byte.
 */
export function fnv1a64(value: string): bigint {
  let hash = FNV1A_64_OFFSET_BASIS;
  for (const byte of encodeUtf8(value)) {
    hash ^= BigInt(byte);
    hash = (hash * FNV1A_64_PRIME) & UINT64_MASK;
  }
  return hash;
}

/**
 * One stateless SplitMix64 mixing step. Constants are the canonical SplitMix64
 * gamma (0x9e3779b97f4a7c15), first multiplier
 * (0xbf58476d1ce4e5b9), and second multiplier
 * (0x94d049bb133111eb). Every multiplication is masked to 64 bits.
 */
export function splitMix64(value: bigint): bigint {
  assertUnsigned64(value, "SplitMix64 input");
  let mixed = (value + SPLITMIX64_GAMMA) & UINT64_MASK;
  mixed = ((mixed ^ (mixed >> 30n)) * SPLITMIX64_MULTIPLIER_ONE) & UINT64_MASK;
  mixed = ((mixed ^ (mixed >> 27n)) * SPLITMIX64_MULTIPLIER_TWO) & UINT64_MASK;
  return (mixed ^ (mixed >> 31n)) & UINT64_MASK;
}

export function splitMix64Sample(seed: bigint, sampleIndex: number): bigint {
  assertUnsigned64(seed, "SplitMix64 seed");
  if (!Number.isSafeInteger(sampleIndex) || sampleIndex < 0) {
    throw new RangeError("sampleIndex must be a non-negative safe integer.");
  }
  const indexedState =
    (seed + BigInt(sampleIndex) * SPLITMIX64_GAMMA) & UINT64_MASK;
  return splitMix64(indexedState);
}

export function unsigned64ToHex(value: bigint): string {
  assertUnsigned64(value, "hex value");
  return value.toString(16).padStart(16, "0");
}
