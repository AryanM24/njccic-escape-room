/** Byte and text primitives. Used by the answer digest, not by the toolbelt. */

const encoder = new TextEncoder();

export function textToBytes(text: string): Uint8Array {
  return encoder.encode(text);
}

export function bytesToHex(bytes: Uint8Array): string {
  let out = '';
  for (const byte of bytes) out += byte.toString(16).padStart(2, '0');
  return out;
}
