// https://github.com/facebook/immutable-js/blob/master/src/Hash.js

const STRING_HASH_CACHE_MIN_STRLEN = 16;
const STRING_HASH_CACHE_MAX_SIZE = 255;

let STRING_HASH_CACHE_SIZE = 0;
let stringHashCache: { [key: string]: number } = {};

const defaultValueOf = Object.prototype.valueOf;
// Get references to ES5 object methods.
const isExtensible = Object.isExtensible;

// If possible, use a WeakMap.
const USING_WEAK_MAP = typeof WeakMap === "function";
let WEAK_MAP: WeakMap<any, number>;
if (USING_WEAK_MAP) {
  WEAK_MAP = new WeakMap();
}

let OBJECT_HASH_UID = 0;

let UID_HASH_KEY: string = "__immutablehash__";
if (typeof Symbol === "function") {
  UID_HASH_KEY = Symbol(UID_HASH_KEY) as any;
}

export const hash = (o: any): number => {
  switch (typeof o) {
    case "boolean":
      // The hash values for built-in constants are a 1 value for each 5-byte
      // shift region expect for the first, which encodes the value. This
      // reduces the odds of a hash collision for these common values.
      return o ? 0x42108421 : 0x42108420;
    case "number":
      return hashNumber(o);
    case "string":
      return o.length > STRING_HASH_CACHE_MIN_STRLEN
        ? cachedHashString(o)
        : hashString(o);
    case "object":
    case "function":
      if (o === null) {
        return 0x42108422;
      }
      if (typeof o.hashCode === "function") {
        // Drop any high bits from accidentally long hash codes.
        return smi(o.hashCode(o));
      }
      if (o.valueOf !== defaultValueOf && typeof o.valueOf === "function") {
        o = o.valueOf(o);
      }
      return hashJSObj(o);
    case "undefined":
      return 0x42108423;
    default:
      if (typeof o.toString === "function") {
        return hashString(o.toString());
      }
      throw new Error("Value type " + typeof o + " cannot be hashed.");
  }
};

// Compress arbitrarily large numbers into smi hashes.
const hashNumber = (n: number): number => {
  if (n !== n || n === Infinity) {
    return 0;
  }
  let hash = n | 0;
  if (hash !== n) {
    hash ^= n * 0xffffffff;
  }
  while (n > 0xffffffff) {
    n /= 0xffffffff;
    hash ^= n;
  }
  return smi(hash);
};

const cachedHashString = (str: string): number => {
  let hashed = stringHashCache[str];

  if (hashed === undefined) {
    hashed = hashString(str);
    if (STRING_HASH_CACHE_SIZE === STRING_HASH_CACHE_MAX_SIZE) {
      STRING_HASH_CACHE_SIZE = 0;
      stringHashCache = {};
    }
    STRING_HASH_CACHE_SIZE++;
    stringHashCache[str] = hashed;
  }

  return hashed;
};

// http://jsperf.com/hashing-strings
const hashString = (str: string): number => {
  // This is the hash from JVM
  // The hash code for a string is computed as
  // s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
  // where s[i] is the ith character of the string and n is the length of
  // the string. We "mod" the result to make it between 0 (inclusive) and 2^31
  // (exclusive) by dropping high bits.
  let hashed = 0;
  for (let ii = 0; ii < str.length; ii++) {
    hashed = (31 * hashed + str.charCodeAt(ii)) | 0;
  }
  return smi(hashed);
};

const hashJSObj = (obj: object): number => {
  let hashed: number | undefined;

  if (USING_WEAK_MAP) {
    hashed = WEAK_MAP.get(obj);
    if (hashed !== undefined) {
      return hashed;
    }
  }

  hashed = (obj as any)[UID_HASH_KEY];
  if (hashed !== undefined) {
    return hashed;
  }

  if (!canDefineProperty) {
    hashed =
      obj.propertyIsEnumerable &&
      (obj as any).propertyIsEnumerable[UID_HASH_KEY];

    if (hashed !== undefined) {
      return hashed;
    }

    hashed = getIENodeHash(obj as Node);
    if (hashed !== undefined) {
      return hashed;
    }
  }

  hashed = ++OBJECT_HASH_UID;
  if (OBJECT_HASH_UID & 0x40000000) {
    OBJECT_HASH_UID = 0;
  }

  if (USING_WEAK_MAP) {
    WEAK_MAP.set(obj, hashed);
  } else if (isExtensible !== undefined && isExtensible(obj) === false) {
    throw new Error("Non-extensible objects are not allowed as keys.");
  } else if (canDefineProperty) {
    Object.defineProperty(obj, UID_HASH_KEY, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: hashed
    });
  } else if (
    obj.propertyIsEnumerable !== undefined &&
    obj.propertyIsEnumerable === obj.constructor.prototype.propertyIsEnumerable
  ) {
    // Since we can't define a non-enumerable property on the object
    // we'll hijack one of the less-used non-enumerable properties to
    // save our hash on it. Since this is a function it will not show up in
    // `JSON.stringify` which is what we want.
    obj.propertyIsEnumerable = function() {
      return this.constructor.prototype.propertyIsEnumerable.apply(
        this,
        arguments
      );
    };
    (obj as any).propertyIsEnumerable[UID_HASH_KEY] = hashed;
  } else if ((obj as any).nodeType !== undefined) {
    // At this point we couldn't get the IE `uniqueID` to use as a hash
    // and we couldn't use a non-enumerable property to exploit the
    // dontEnum bug so we simply add the `UID_HASH_KEY` on the node
    // itself.
    (obj as any)[UID_HASH_KEY] = hashed;
  } else {
    throw new Error("Unable to set a non-enumerable property on object.");
  }

  return hashed;
};

// True if Object.defineProperty works as expected. IE8 fails this test.
const canDefineProperty = (() => {
  try {
    Object.defineProperty({}, "@", {});
    return true;
  } catch (e) {
    return false;
  }
})();

// IE has a `uniqueID` property on DOM nodes. We can construct the hash from it
// and avoid memory leaks from the IE cloneNode bug.
const getIENodeHash = (node: Node): number | undefined => {
  if (node && node.nodeType > 0) {
    switch (node.nodeType) {
      case 1: // Element
        return (node as any).uniqueID;
      case 9: // Document
        return (
          (node as any).documentElement &&
          ((node as any).documentElement as any).uniqueID
        );
    }
  }
};

// v8 has an optimization for storing 31-bit signed numbers.
// Values which have either 00 or 11 as the high order bits qualify.
// This function drops the highest order bit in a signed number, maintaining
// the sign bit.
const smi = (i32: number): number => {
  return ((i32 >>> 1) & 0x40000000) | (i32 & 0xbfffffff);
};
