import { describe, expect, it, vi } from "vitest";
import { Iter, range } from "./iter.js";

describe("Iter", () => {
	it("verkettet map/filter/take", () => {
		const result = Iter([1, 2, 3, 4, 5])
			.map((x) => x * 2)
			.filter((x) => x > 4)
			.take(2)
			.toArray();
		expect(result).toEqual([6, 8]);
	});

	it("ist lazy — verarbeitet nur, was take() konsumiert", () => {
		const spy = vi.fn((x: number) => x * 2);
		const result = Iter([1, 2, 3, 4, 5]).map(spy).take(2).toArray();

		expect(result).toEqual([2, 4]);
		expect(spy).toHaveBeenCalledTimes(2); // nicht 5
	});

	it("ist re-iterierbar bei re-iterierbarer Quelle", () => {
		const iter = Iter([1, 2, 3]).map((x) => x + 1);
		expect(iter.toArray()).toEqual([2, 3, 4]);
		expect(iter.toArray()).toEqual([2, 3, 4]);
	});

	it("flatMap flacht ab", () => {
		const result = Iter([1, 2, 3])
			.flatMap((x) => [x, x * 10])
			.toArray();
		expect(result).toEqual([1, 10, 2, 20, 3, 30]);
	});

	it("zip stoppt an der kürzeren Seite", () => {
		const result = Iter([1, 2, 3]).zip(["a", "b"]).toArray();
		expect(result).toEqual([
			[1, "a"],
			[2, "b"],
		]);
	});

	it("drop, enumerate und concat", () => {
		expect(Iter([1, 2, 3, 4]).drop(2).toArray()).toEqual([3, 4]);
		expect(Iter(["a", "b"]).enumerate().toArray()).toEqual([
			[0, "a"],
			[1, "b"],
		]);
		expect(Iter([1]).concat([2, 3]).toArray()).toEqual([1, 2, 3]);
	});

	it("fold und reduce", () => {
		expect(Iter([1, 2, 3, 4]).fold(0, (a, b) => a + b)).toBe(10);
		expect(
			Iter([1, 2, 3])
				.reduce((a, b) => a + b)
				.unwrap(),
		).toBe(6);
		expect(
			Iter<number>([])
				.reduce((a, b) => a + b)
				.isNone(),
		).toBe(true);
	});

	it("find und first liefern Option", () => {
		expect(
			Iter([1, 2, 3])
				.find((x) => x > 1)
				.unwrap(),
		).toBe(2);
		expect(
			Iter([1, 2, 3])
				.find((x) => x > 9)
				.isNone(),
		).toBe(true);
		expect(Iter([5, 6]).first().unwrap()).toBe(5);
		expect(Iter<number>([]).first().isNone()).toBe(true);
	});

	it("some, every und count", () => {
		expect(Iter([1, 2, 3]).some((x) => x === 2)).toBe(true);
		expect(Iter([1, 2, 3]).every((x) => x > 0)).toBe(true);
		expect(Iter([1, 2, 3]).every((x) => x > 1)).toBe(false);
		expect(Iter([1, 2, 3, 4]).count()).toBe(4);
	});

	it("toSet dedupliziert", () => {
		expect(Iter([1, 1, 2, 2, 3]).toSet()).toEqual(new Set([1, 2, 3]));
	});
});

describe("range", () => {
	it("erzeugt einen aufsteigenden Bereich [start, end)", () => {
		expect(range(0, 5).toArray()).toEqual([0, 1, 2, 3, 4]);
	});

	it("unterstützt einen negativen Schritt", () => {
		expect(range(10, 0, -2).toArray()).toEqual([10, 8, 6, 4, 2]);
	});

	it("ist lazy verkettbar", () => {
		expect(
			range(0, 1000)
				.map((x) => x * x)
				.take(3)
				.toArray(),
		).toEqual([0, 1, 4]);
	});

	it("wirft bei Schritt 0", () => {
		expect(() => range(0, 5, 0).toArray()).toThrow();
	});
});
