import { describe, expect, it } from "vitest";
import { None, Some } from "../option/option.js";
import { Err, Ok } from "../result/result.js";
import { Invalid, Valid, Validated } from "./validated.js";

describe("Validated", () => {
	it("map transformiert nur Valid", () => {
		expect(
			Valid<number>(2)
				.map((x) => x + 1)
				.getOrElse(0),
		).toBe(3);
		expect(
			Invalid<string, number>("e")
				.map((x) => x + 1)
				.getOrElse(0),
		).toBe(0);
	});

	it("mapErrors transformiert jeden Fehler", () => {
		const result = Invalid<string, number>("boom").mapErrors((e) =>
			e.toUpperCase(),
		);
		expect(result.toResult()).toEqual(Err(["BOOM"]));
	});

	it("zip akkumuliert Fehler beider Seiten", () => {
		const a = Invalid<string, number>("a fehlt");
		const b = Invalid<string, number>("b fehlt");
		const zipped = a.zip(b);
		expect(zipped.toResult()).toEqual(Err(["a fehlt", "b fehlt"]));
	});

	it("zip kombiniert zwei Valid zu einem Tupel", () => {
		const zipped = Valid<number, string>(1).zip(Valid<string, string>("x"));
		expect(zipped.getOrElse([0, ""])).toEqual([1, "x"]);
	});

	it("all sammelt ALLE Fehler", () => {
		const result = Validated.all<string, number>([
			Valid(1),
			Invalid("zu klein"),
			Invalid("ungerade"),
		]);
		expect(result.toResult()).toEqual(Err(["zu klein", "ungerade"]));
	});

	it("all gibt Valid mit allen Werten, wenn nichts fehlschlägt", () => {
		const result = Validated.all<string, number>([
			Valid(1),
			Valid(2),
			Valid(3),
		]);
		expect(result.toResult()).toEqual(Ok([1, 2, 3]));
	});

	it("map2 kombiniert zwei Validierungen", () => {
		const sum = Validated.map2(
			Valid<number, string>(2),
			Valid<number, string>(3),
			(a, b) => a + b,
		);
		expect(sum.getOrElse(0)).toBe(5);
	});

	it("fromResult und toResult sind ein Round-trip", () => {
		expect(Validated.fromResult(Ok<number, string>(5)).toResult()).toEqual(
			Ok(5),
		);
		expect(Validated.fromResult(Err<number, string>("x")).toResult()).toEqual(
			Err(["x"]),
		);
	});

	it("fromOption nutzt den Fallback-Fehler bei None", () => {
		expect(Validated.fromOption(Some(7), "leer").getOrElse(0)).toBe(7);
		expect(Validated.fromOption(None<number>(), "leer").toResult()).toEqual(
			Err(["leer"]),
		);
	});
});
