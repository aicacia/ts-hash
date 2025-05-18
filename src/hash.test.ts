import * as tape from "tape";
import { integerToBytes, bytesToInteger } from ".";
import { hashOf } from ".";

tape("bytesToInteger/bytesFromInteger", (assert: tape.Test) => {
	[0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096].map((number) => {
		assert.equal(
			bytesToInteger(integerToBytes(new Uint8Array(4), number)),
			number,
		);
	});
	assert.end();
});

tape("hash it all", (assert: tape.Test) => {
	const string = "Hello, world!";
	const number = 10;
	const float = Math.PI;
	const boolean = true;
	const array = [boolean, 1];
	const object = { key: "value" };
	const symbol = Symbol("symbol");
	const noop = () => undefined;
	const fac = (x: number): number => (x < 2 ? 1 : x * fac(x - 1));
	const all = { string, number, float, array, object, symbol };
	assert.equal(hashOf(boolean), 1);
	assert.equal(hashOf(string), -867622775);
	assert.equal(hashOf(number), 10);
	assert.equal(hashOf(float), 6540971);
	assert.equal(hashOf(array), -732789116);
	assert.equal(hashOf(object), -411031449);
	assert.equal(hashOf(symbol), -617543331);
	assert.equal(hashOf(all), 713529838);
	assert.equal(hashOf(Promise), -653727512);
	assert.equal(
		hashOf(function fac(x: number): number {
			return x < 2 ? 1 : x * fac(x - 1);
		}),
		873356686,
	);
	assert.equal(hashOf(fac), 619930563);
	assert.equal(hashOf(noop), -379933830);
	assert.equal(
		hashOf(() => undefined),
		-598381250,
	);
	assert.equal(hashOf(new Map([[Symbol("map-key"), "map-value"]])), 310022534);
	assert.end();
});

tape("hash recur", (assert: tape.Test) => {
	const object: Record<string, unknown> = { self: null };
	object.self = object;
	assert.equal(hashOf(object), 679247147);
	assert.end();
});
