import type { Hasher } from "./Hasher";
import { FastHasher } from "./FastHasher";

export function defaultHasher(): Hasher {
	return new FastHasher();
}
