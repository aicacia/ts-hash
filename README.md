# ts-hash

non secure hash function

```ts
import { hash } from "@stembord/hash";

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
