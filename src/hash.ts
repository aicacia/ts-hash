import type { Hasher } from "./Hasher";
import { defaultHasher } from "./defaultHasher";

const ALREADY_HASHED_SET = new Set<any>();

export function hashOf(
  value: any,
  getHasher: () => Hasher = defaultHasher
): number {
  return hash(value, getHasher()).finish();
}

export function hash<H extends Hasher = Hasher>(value: any, hasher: H): H {
  hashInternal(value, hasher);
  ALREADY_HASHED_SET.clear();
  return hasher;
}

function hashInternal<H extends Hasher = Hasher>(value: any, hasher: H): H {
  if (value != null && !ALREADY_HASHED_SET.has(value)) {
    ALREADY_HASHED_SET.add(value);

    if (typeof value === "string") {
      hashString(value, hasher);
    } else if (typeof value === "number") {
      hashNumber(value, hasher);
    } else if (typeof value === "boolean") {
      hashBoolean(value, hasher);
    } else if (typeof value === "symbol") {
      hashSymbol(value, hasher);
    } else if (typeof value[Symbol.iterator] === "function") {
      hashIterable(value, hasher);
    } else if (typeof value.length === "number") {
      hashArray(value, hasher);
    } else {
      hashObject(value, hasher);
    }
  }
  return hasher;
}

function hashString(value: string, hasher: Hasher) {
  for (const char of value) {
    hasher.writeInteger(char.charCodeAt(0));
  }
}

function hashNumber(value: number, hasher: Hasher) {
  hasher.writeInteger(value);
}

function hashBoolean(value: boolean, hasher: Hasher) {
  hasher.writeInteger(value === true ? 1 : 0);
}

function hashSymbol(value: symbol, hasher: Hasher) {
  hashString(value.toString(), hasher);
}

function hashIterable(iterable: Iterable<any>, hasher: Hasher) {
  let length = 0;
  for (const value of iterable) {
    hashInternal(value, hasher);
    length++;
  }
  hashNumber(length, hasher);
}

function hashArray(array: Array<any>, hasher: Hasher) {
  for (let i = 0, il = array.length; i < il; i++) {
    hashInternal(array[i], hasher);
  }
  hashNumber(array.length, hasher);
}

function hashObject(value: any, hasher: Hasher) {
  let length = 0;
  for (const key in value) {
    if (value.hasOwnProperty(key)) {
      hashString(key, hasher);
      hashInternal(value[key], hasher);
      length++;
    }
  }
  hashNumber(length, hasher);
}
