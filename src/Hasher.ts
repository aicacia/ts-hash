import { integerToBytes } from "./integerToBytes";

const BYTE_ARRAY = new Uint8Array(1),
  INTEGER_ARRAY = new Uint8Array(4);

export abstract class Hasher {
  abstract finish(): number;
  abstract write<B extends Uint8Array | number[] = Uint8Array | number[]>(
    bytes: B
  ): this;

  writeByte(byte: number) {
    BYTE_ARRAY[0] = byte;
    return this.write(BYTE_ARRAY);
  }
  writeInteger(integer: number) {
    return this.write(integerToBytes(INTEGER_ARRAY, integer));
  }
}
