import { describe, expect, it, vi } from "vitest";
import { Iter } from "./iter.js";

describe("Iter", () => {
	it("chains map/filter/take", () => {
		const result = Iter([1, 2, 3, 4, 5])
			.map((x) => x * 2)
			.filter((x) => x > 4)
			.take(2)
			.toArray();
		expect(result).toEqual([6, 8]);
	});

	it("is lazy: processes only what take() consumes", () => {
		const spy = vi.fn((x: number) => x * 2);
		const result = Iter([1, 2, 3, 4, 5]).map(spy).take(2).toArray();

		expect(result).toEqual([2, 4]);
		expect(spy).toHaveBeenCalledTimes(2); // not 5
	});

	it("is re-iterable when the source is re-iterable", () => {
		const iter = Iter([1, 2, 3]).map((x) => x + 1);
		expect(iter.toArray()).toEqual([2, 3, 4]);
		expect(iter.toArray()).toEqual([2, 3, 4]);
	});

	it("flatMap flattens", () => {
		const result = Iter([1, 2, 3])
			.flatMap((x) => [x, x * 10])
			.toArray();
		expect(result).toEqual([1, 10, 2, 20, 3, 30]);
	});

	it("zip stops at the shorter side", () => {
		const result = Iter([1, 2, 3]).zip(["a", "b"]).toArray();
		expect(result).toEqual([
			[1, "a"],
			[2, "b"],
		]);
	});

	it("drop, entries and concat", () => {
		expect(Iter([1, 2, 3, 4]).drop(2).toArray()).toEqual([3, 4]);
		expect(Iter(["a", "b"]).entries().toArray()).toEqual([
			[0, "a"],
			[1, "b"],
		]);
		expect(Iter([1]).concat([2, 3]).toArray()).toEqual([1, 2, 3]);
	});

	it("reduce with and without a seed", () => {
		expect(Iter([1, 2, 3, 4]).reduce((a, b) => a + b, 0)).toBe(10);
		expect(
			Iter([1, 2, 3])
				.reduce((a, b) => a + b)
				.getOrThrow(),
		).toBe(6);
		expect(
			Iter<number>([])
				.reduce((a, b) => a + b)
				.isEmpty(),
		).toBe(true);
	});

	it("find and first return Option", () => {
		expect(
			Iter([1, 2, 3])
				.find((x) => x > 1)
				.getOrThrow(),
		).toBe(2);
		expect(
			Iter([1, 2, 3])
				.find((x) => x > 9)
				.isEmpty(),
		).toBe(true);
		expect(Iter([5, 6]).first().getOrThrow()).toBe(5);
		expect(Iter<number>([]).first().isEmpty()).toBe(true);
	});

	it("some, every and count", () => {
		expect(Iter([1, 2, 3]).some((x) => x === 2)).toBe(true);
		expect(Iter([1, 2, 3]).every((x) => x > 0)).toBe(true);
		expect(Iter([1, 2, 3]).every((x) => x > 1)).toBe(false);
		expect(Iter([1, 2, 3, 4]).count()).toBe(4);
	});

	it("toSet deduplicates", () => {
		expect(Iter([1, 1, 2, 2, 3]).toSet()).toEqual(new Set([1, 2, 3]));
	});
});

describe("Iter.range", () => {
	it("builds an ascending range [start, end)", () => {
		expect(Iter.range(0, 5).toArray()).toEqual([0, 1, 2, 3, 4]);
	});

	it("supports a negative step", () => {
		expect(Iter.range(10, 0, -2).toArray()).toEqual([10, 8, 6, 4, 2]);
	});

	it("chains lazily", () => {
		expect(
			Iter.range(0, 1000)
				.map((x) => x * x)
				.take(3)
				.toArray(),
		).toEqual([0, 1, 4]);
	});

	it("throws on a step of 0", () => {
		expect(() => Iter.range(0, 5, 0).toArray()).toThrow();
	});
});
