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
  if (value != null) {
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
    } else if (typeof value === "function") {
      hashFunction(value, hasher);
    } else if (typeof value.length === "number") {
      hashArray(value, hasher);
    } else if (value instanceof Date) {
      hashDate(value, hasher);
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
  if (value % 1 === 0) {
    hasher.writeInteger(value);
  } else {
    hasher.writeFloat(value);
  }
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

function hashFunction(value: (...args: any[]) => any, hasher: Hasher) {
  if (value.prototype !== null && typeof value.prototype === "object") {
    hashObject(value.prototype, hasher);
  }
  hashString(value.name, hasher);
  hashNumber(value.length, hasher);
  hashString(value.toString(), hasher);
}

function hashArray(array: Array<any>, hasher: Hasher) {
  if (!ALREADY_HASHED_SET.has(array)) {
    ALREADY_HASHED_SET.add(array);
    const prototype = Object.getPrototypeOf(array);
    if (
      prototype !== null &&
      typeof prototype === "object" &&
      typeof prototype.constructor === "function"
    ) {
      hashFunction(prototype.constructor, hasher);
    }
    for (let i = 0, il = array.length; i < il; i++) {
      hashInternal(array[i], hasher);
    }
    hashNumber(array.length, hasher);
  }
}

function hashDate(date: Date, hasher: Hasher) {
  hashNumber(date.valueOf(), hasher);
}

function hashObject(
  object: { [key: string | symbol | number]: unknown },
  hasher: Hasher
) {
  if (!ALREADY_HASHED_SET.has(object)) {
    ALREADY_HASHED_SET.add(object);
    const prototype = Object.getPrototypeOf(object);
    if (
      prototype !== null &&
      typeof prototype === "object" &&
      typeof prototype.constructor === "function"
    ) {
      hashFunction(prototype.constructor, hasher);
    }
    let length = 0;
    for (const [k, v] of Object.entries(object)) {
      hashString(k, hasher);
      hashInternal(v, hasher);
      length++;
    }
    hashNumber(length, hasher);
  }
}
