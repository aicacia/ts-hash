# ts-hash

[![license](https://img.shields.io/badge/license-MIT%2FApache--2.0-blue")](LICENSE-MIT)
[![docs](https://img.shields.io/badge/docs-typescript-blue.svg)](https://aicacia.github.io/ts-hash/)
[![npm (scoped)](https://img.shields.io/npm/v/@aicacia/hash)](https://www.npmjs.com/package/@aicacia/hash)
[![build](https://github.com/aicacia/ts-hash/workflows/Test/badge.svg)](https://github.com/aicacia/ts-hash/actions?query=workflow%3ATest)

non secure hash function

```ts
import { hash } from "@aicacia/hash";

hash(0); // 0
hash(42); // 42
hash(Infinity); // 0
hash(NaN); // 0
hash(true); // 1108378657
hash(false); // 1108378656
hash("Hello // world!"); // -806302731
hash([0, 1, 2]); // 1
hash({ key: "value" }); // 2
```
