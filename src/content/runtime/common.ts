export function compareAscii(left: string, right: string): number {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

export function uniqueSorted(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)].sort(compareAscii));
}

function versionParts(value: string): readonly number[] {
  const separatorIndex = value.indexOf("-");
  return value
    .slice(separatorIndex + 1)
    .split(".")
    .map((part) => Number(part));
}

export function compareVersionStrings(left: string, right: string): number {
  const leftParts = versionParts(left);
  const rightParts = versionParts(right);
  for (let index = 0; index < 3; index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference !== 0) return difference < 0 ? -1 : 1;
  }
  return 0;
}
