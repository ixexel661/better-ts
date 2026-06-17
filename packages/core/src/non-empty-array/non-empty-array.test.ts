import { describe, expect, it } from "vitest";
import {
	head,
	isNonEmpty,
	last,
	mapNonEmpty,
	type NonEmptyArray,
	nonEmpty,
	of,
	tail,
} from "./non-empty-array.js";

describe("NonEmptyArray", () => {
	it("isNonEmpty narrowt korrekt", () => {
		expect(isNonEmpty([1])).toBe(true);
		expect(isNonEmpty([])).toBe(false);
	});

	it("nonEmpty: Some bei Inhalt, None bei leer", () => {
		expect(nonEmpty([1, 2]).isSome()).toBe(true);
		expect(nonEmpty([]).isNone()).toBe(true);
	});

	it("of erzeugt ein NonEmptyArray", () => {
		const xs: NonEmptyArray<number> = of(1, 2, 3);
		expect(xs).toEqual([1, 2, 3]);
	});

	it("head / last / tail", () => {
		const xs: NonEmptyArray<number> = [1, 2, 3];
		expect(head(xs)).toBe(1);
		expect(last(xs)).toBe(3);
		expect(tail(xs)).toEqual([2, 3]);
	});

	it("head / last bei einem Element", () => {
		const xs: NonEmptyArray<number> = [9];
		expect(head(xs)).toBe(9);
		expect(last(xs)).toBe(9);
		expect(tail(xs)).toEqual([]);
	});

	it("mapNonEmpty erhält die Länge und transformiert", () => {
		const xs: NonEmptyArray<number> = [1, 2, 3];
		const ys = mapNonEmpty(xs, (x) => x * 2);
		expect(ys).toEqual([2, 4, 6]);
		expect(ys.length).toBe(3);
		// head is allowed on the result -> non-emptiness preserved
		expect(head(ys)).toBe(2);
	});
});
