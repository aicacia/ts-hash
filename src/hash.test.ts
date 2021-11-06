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
    boolean = true,
    array = [boolean, 1],
    object = { key: "value" },
    symbol = Symbol("symbol");
  const all = { string, number, array, object, symbol };
  assert.equal(hashOf(boolean), 1);
  assert.equal(hashOf(string), -867622775);
  assert.equal(hashOf(number), 10);
  assert.equal(hashOf(array), -732789116);
  assert.equal(hashOf(object), -411031449);
  assert.equal(hashOf(symbol), -617543331);
  assert.equal(hashOf(all), 418146860);
  assert.end();
});

tape("hash recur", (assert: tape.Test) => {
  const object: Record<string, any> = { self: null };
  object.self = object;
  assert.equal(hashOf(object), 679247147);
  assert.end();
});
