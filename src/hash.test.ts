import * as tape from "tape";
import {
  hash,
  STRING_HASH_CACHE_MAX_SIZE,
  STRING_HASH_CACHE_MIN_STRLEN,
} from ".";

tape("hash", (assert: tape.Test) => {
  assert.equals(hash(0), 0);
  assert.equals(hash(42), 42);
  assert.equals(hash(Infinity), 0);
  assert.equals(hash(NaN), 0);
  assert.equals(hash(true), 1108378657);
  assert.equals(hash(false), 1108378656);
  assert.equals(hash("Hello, world!"), -806302731);
  assert.equals(hash([0, 1, 2]), 1);
  const obj = { key: "value" };
  assert.equals(hash(obj), 2);
  assert.equals(hash(obj), 2);
  assert.equals(
    hash(() => undefined),
    3
  );
  assert.equals(hash(null), 1108378658);
  assert.equals(hash(undefined), 1108378659);
  assert.equals(hash({ hashCode: () => 1 }), 1, "call hashCode functions");
  assert.equals(hash({ valueOf: () => ({}) }), 4, "call valueOf functions");
  assert.equals(hash(Math.pow(2, 52) - 1), -1048577, "really big number");
  assert.end();
});

tape("hash large string cache", (assert: tape.Test) => {
  for (let i = 0; i < STRING_HASH_CACHE_MAX_SIZE + 1; i++) {
    hash(createRandomString(STRING_HASH_CACHE_MIN_STRLEN + 1));
  }
  assert.end();
});

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function getRandomChar() {
  return CHARS.charAt(Math.floor(Math.random() * CHARS.length));
}

function createRandomString(length: number) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += getRandomChar();
  }
  return result;
}
