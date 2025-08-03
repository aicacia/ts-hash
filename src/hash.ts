import type { Hasher } from "./Hasher";
import { defaultHasher } from "./defaultHasher";

const ALREADY_HASHED_SET = new Set<unknown>();

export function hashOf(
	value: unknown,
	getHasher: () => Hasher = defaultHasher,
): number {
	return hash(value, getHasher()).finish();
}

export function hash<H extends Hasher = Hasher>(value: unknown, hasher: H): H {
	hashInternal(value, hasher);
	ALREADY_HASHED_SET.clear();
	return hasher;
}

function hashInternal<H extends Hasher = Hasher>(value: unknown, hasher: H): H {
	if (value != null) {
		const type = typeof value;
		if (type === "number") {
			hashNumber(value as never, hasher);
		} else if (type === "string") {
			hashString(value as never, hasher);
		} else if (type === "boolean") {
			hashBoolean(value as never, hasher);
		} else if (type === "symbol") {
			hashSymbol(value as never, hasher);
		} else if (typeof (value as never)[Symbol.iterator] === "function") {
			hashIterable(value as never, hasher);
		} else if (type === "function") {
			hashFunction(value as never, hasher);
		} else {
			hashObject(value as never, hasher);
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
	hasher.writeByte(value === true ? 1 : 0);
}

function hashSymbol(value: symbol, hasher: Hasher) {
	hashString(value.toString(), hasher);
}

function hashIterable(iterable: Iterable<unknown>, hasher: Hasher) {
	const prototype = Object.getPrototypeOf(iterable);
	if (
		prototype !== null &&
		typeof prototype === "object" &&
		typeof prototype.constructor === "function"
	) {
		hashObject(prototype.constructor, hasher);
	}
	let length = 0;
	for (const value of iterable) {
		hashInternal(value, hasher);
		length++;
	}
	hashNumber(length, hasher);
}

function hashFunction(func: (...args: unknown[]) => unknown, hasher: Hasher) {
	if (!ALREADY_HASHED_SET.has(func)) {
		ALREADY_HASHED_SET.add(func);
		if (func.prototype !== null && typeof func.prototype === "object") {
			hashObject(func.prototype, hasher);
		}
		hashString(func.name, hasher);
		hashNumber(func.length, hasher);
		hashString(func.toString(), hasher);
		let length = 0;
		for (const [k, v] of Object.entries(func)) {
			hashString(k, hasher);
			hashInternal(v, hasher);
			length++;
		}
		hashNumber(length, hasher);
	}
}

function hashObject(
	object: { [key: string | symbol | number]: unknown },
	hasher: Hasher,
) {
	if (!ALREADY_HASHED_SET.has(object)) {
		ALREADY_HASHED_SET.add(object);
		let length = 0;
		for (const [k, v] of Object.entries(object)) {
			hashString(k, hasher);
			hashInternal(v, hasher);
			length++;
		}
		hashNumber(length, hasher);
	}
}
