const REPLACEMENT_CHARACTER = 0xfffd;

function pushCodePoint(bytes: number[], codePoint: number): void {
  if (codePoint <= 0x7f) {
    bytes.push(codePoint);
    return;
  }
  if (codePoint <= 0x7ff) {
    bytes.push(0xc0 | (codePoint >> 6));
    bytes.push(0x80 | (codePoint & 0x3f));
    return;
  }
  if (codePoint <= 0xffff) {
    bytes.push(0xe0 | (codePoint >> 12));
    bytes.push(0x80 | ((codePoint >> 6) & 0x3f));
    bytes.push(0x80 | (codePoint & 0x3f));
    return;
  }
  bytes.push(0xf0 | (codePoint >> 18));
  bytes.push(0x80 | ((codePoint >> 12) & 0x3f));
  bytes.push(0x80 | ((codePoint >> 6) & 0x3f));
  bytes.push(0x80 | (codePoint & 0x3f));
}

/**
 * Encodes UTF-8 without TextEncoder or Node APIs. Unpaired UTF-16 surrogates
 * become U+FFFD, matching the Unicode replacement behavior of standard UTF-8
 * encoders. This contract is part of the versioned deterministic hash input.
 */
export function encodeUtf8(value: string): readonly number[] {
  const bytes: number[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const first = value.charCodeAt(index);
    if (first >= 0xd800 && first <= 0xdbff) {
      const second = value.charCodeAt(index + 1);
      if (second >= 0xdc00 && second <= 0xdfff) {
        const codePoint =
          0x10000 + ((first - 0xd800) << 10) + (second - 0xdc00);
        pushCodePoint(bytes, codePoint);
        index += 1;
      } else {
        pushCodePoint(bytes, REPLACEMENT_CHARACTER);
      }
    } else if (first >= 0xdc00 && first <= 0xdfff) {
      pushCodePoint(bytes, REPLACEMENT_CHARACTER);
    } else {
      pushCodePoint(bytes, first);
    }
  }
  return bytes;
}
