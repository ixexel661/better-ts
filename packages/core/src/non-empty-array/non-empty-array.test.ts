import { describe, expect, it } from "vitest";
import { NonEmptyArray } from "./non-empty-array.js";

describe("NonEmptyArray", () => {
	it("isNonEmpty narrows correctly", () => {
		expect(NonEmptyArray.isNonEmpty([1])).toBe(true);
		expect(NonEmptyArray.isNonEmpty([])).toBe(false);
	});

	it("fromArray: value when non-empty, empty when empty", () => {
		expect(NonEmptyArray.fromArray([1, 2]).hasValue()).toBe(true);
		expect(NonEmptyArray.fromArray([]).isEmpty()).toBe(true);
	});

	it("of builds a NonEmptyArray", () => {
		const xs: NonEmptyArray<number> = NonEmptyArray.of(1, 2, 3);
		expect(xs).toEqual([1, 2, 3]);
	});

	it("first / last / rest", () => {
		const xs: NonEmptyArray<number> = [1, 2, 3];
		expect(NonEmptyArray.first(xs)).toBe(1);
		expect(NonEmptyArray.last(xs)).toBe(3);
		expect(NonEmptyArray.rest(xs)).toEqual([2, 3]);
	});

	it("first / last with a single element", () => {
		const xs: NonEmptyArray<number> = [9];
		expect(NonEmptyArray.first(xs)).toBe(9);
		expect(NonEmptyArray.last(xs)).toBe(9);
		expect(NonEmptyArray.rest(xs)).toEqual([]);
	});

	it("map preserves the length and transforms", () => {
		const xs: NonEmptyArray<number> = [1, 2, 3];
		const ys = NonEmptyArray.map(xs, (x) => x * 2);
		expect(ys).toEqual([2, 4, 6]);
		expect(ys.length).toBe(3);
		// first is allowed on the result, so non-emptiness is preserved
		expect(NonEmptyArray.first(ys)).toBe(2);
	});
});
