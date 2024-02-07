import * as tape from "tape";
import { integerToBytes, bytesToInteger } from ".";
import { hashOf } from ".";

tape("bytesToInteger/bytesFromInteger", (assert: tape.Test) => {
  [0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096].map((number) => {
    assert.equal(
      bytesToInteger(integerToBytes(new Uint8Array(4), number)),
      number
    );
  });
  assert.end();
});

tape("hash it all", (assert: tape.Test) => {
  const string = "Hello, world!",
    number = 10,
    float = Math.PI,
    boolean = true,
    array = [boolean, 1],
    object = { key: "value" },
    symbol = Symbol("symbol"),
    noop = () => undefined,
    fac = (x: number): number => (x < 2 ? 1 : x * fac(x - 1));
  const all = { string, number, float, array, object, symbol };
  assert.equal(hashOf(boolean), 1);
  assert.equal(hashOf(string), -867622775);
  assert.equal(hashOf(number), 10);
  assert.equal(hashOf(float), 6540971);
  assert.equal(hashOf(array), -732789116);
  assert.equal(hashOf(object), 175385407);
  assert.equal(hashOf(symbol), -617543331);
  assert.equal(hashOf(all), 895435550);
  assert.equal(hashOf(Promise), 419871680);
  assert.equal(
    hashOf(function fac(x: number): number {
      return x < 2 ? 1 : x * fac(x - 1);
    }),
    154384486
  );
  assert.equal(hashOf(fac), 619930563);
  assert.equal(hashOf(noop), -379933830);
  assert.equal(
    hashOf(() => undefined),
    -598381250
  );
  assert.equal(hashOf(new Map([[Symbol("map-key"), "map-value"]])), 310022534);
  assert.end();
});

tape("hash recur", (assert: tape.Test) => {
  const object: Record<string, any> = { self: null };
  object.self = object;
  assert.equal(hashOf(object), 666972163);
  assert.end();
});

tape("hash dates", (assert: tape.Test) => {
  assert.equal(hashOf(new Date(1707318119003)), 3954916);
  assert.notEqual(
    hashOf(new Date(1707318119003)),
    hashOf(new Date(1707318139739))
  );
  assert.end();
});
