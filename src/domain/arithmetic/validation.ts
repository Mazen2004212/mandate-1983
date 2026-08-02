const MIN_SAFE_INTEGER_BIGINT = BigInt(Number.MIN_SAFE_INTEGER);
const MAX_SAFE_INTEGER_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);

export function assertSafeInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`${label} must be a finite safe integer.`);
  }
}

export function assertBigInt(value: bigint, label: string): void {
  if (typeof value !== "bigint") {
    throw new TypeError(`${label} must be a bigint.`);
  }
}

export function safeBigIntToNumber(value: bigint, label: string): number {
  if (value < MIN_SAFE_INTEGER_BIGINT || value > MAX_SAFE_INTEGER_BIGINT) {
    throw new RangeError(`${label} exceeds safe-integer arithmetic.`);
  }
  return Number(value);
}

export function assertSafeBigInt(value: bigint, label: string): void {
  safeBigIntToNumber(value, label);
}
