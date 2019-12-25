import tape = require("tape");
import { hash } from ".";

tape("hash", (assert: tape.Test) => {
  assert.equals(hash(0), 0);
  assert.equals(hash(42), 42);
  assert.equals(hash(Infinity), 0);
  assert.equals(hash(NaN), 0);
  assert.equals(hash(true), 1108378657);
  assert.equals(hash(false), 1108378656);
  assert.equals(hash("Hello, world!"), -806302731);
  assert.equals(hash([0, 1, 2]), 1);
  assert.equals(hash({ key: "value" }), 2);
  assert.end();
});
