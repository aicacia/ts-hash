export function bytesToInteger<
  B extends Uint8Array | [number, number, number, number] =
    | Uint8Array
    | [number, number, number, number]
>(bytes: B): number {
  return bytes[3] | (bytes[2] << 8) | (bytes[1] << 16) | (bytes[0] << 24);
}
