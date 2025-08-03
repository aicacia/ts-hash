import tape from "tape";
import { hashOf, integerToBytes, bytesToInteger } from ".";

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
	const trueBoolean = true;
	const falseBoolean = false;
	const symbol = Symbol("symbol");
	const object = { key: "value" };
	const map = new Map(Object.entries(object));
	const set = new Set([symbol]);
	const noop = () => undefined;
	const fac = (x: number): number => (x < 2 ? 1 : x * fac(x - 1));
	const array = [
		string,
		number,
		float,
		trueBoolean,
		falseBoolean,
		symbol,
		object,
		map,
		set,
		noop,
		fac,
	];
	const all = {
		string,
		number,
		float,
		trueBoolean,
		falseBoolean,
		symbol,
		object,
		map,
		set,
		noop,
		fac,
		array,
	};
	assert.equal(hashOf(string), -867622775);
	assert.equal(hashOf(number), 10);
	assert.equal(hashOf(float), 6540971);
	assert.equal(hashOf(trueBoolean), 1);
	assert.equal(hashOf(falseBoolean), 0);
	assert.equal(hashOf(symbol), -617543331);
	assert.equal(hashOf(object), -411031449);
	assert.equal(hashOf(map), 551924841);
	assert.equal(hashOf(set), 514003678);
	assert.equal(hashOf(noop), -23253480);
	assert.equal(hashOf(fac), 811075553);
	assert.equal(hashOf(array), 1027625708);
	assert.equal(hashOf(all), -707391520);
	assert.equal(hashOf(Promise), -417712920);
	assert.equal(hashOf(new Map([[Symbol("map-key"), "map-value"]])), 310022534);
	assert.end();
});

tape("hash empties", (assert: tape.Test) => {
	assert.equal(hashOf([]), hashOf([]));
	assert.equal(hashOf({}), hashOf({}));
	assert.equal(hashOf(new Set()), hashOf(new Set()));
	assert.equal(hashOf(new Map()), hashOf(new Map()));
	assert.end();
});

tape("hash recur", (assert: tape.Test) => {
	const object: Record<string, unknown> = { self: null };
	object.self = object;
	assert.equal(hashOf(object), 679247147);
	assert.end();
});
