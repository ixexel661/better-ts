import { describe, expect, it } from "vitest";
import { Option } from "../option/option.js";
import { Result } from "../result/result.js";
import { Validated } from "./validated.js";

describe("Validated", () => {
	it("map transforms only Valid", () => {
		expect(
			Validated.valid<number>(2)
				.map((x) => x + 1)
				.getOrElse(() => 0),
		).toBe(3);
		expect(
			Validated.invalid<string, number>("e")
				.map((x) => x + 1)
				.getOrElse(() => 0),
		).toBe(0);
	});

	it("mapErrors transforms every error", () => {
		const result = Validated.invalid<string, number>("boom").mapErrors((e) =>
			e.toUpperCase(),
		);
		expect(result.toResult()).toEqual(Result.error(["BOOM"]));
	});

	it("zip accumulates errors from both sides", () => {
		const a = Validated.invalid<string, number>("a missing");
		const b = Validated.invalid<string, number>("b missing");
		const zipped = a.zip(b);
		expect(zipped.toResult()).toEqual(Result.error(["a missing", "b missing"]));
	});

	it("zip combines two Valid into a tuple", () => {
		const zipped = Validated.valid<number, string>(1).zip(
			Validated.valid<string, string>("x"),
		);
		expect(zipped.getOrElse(() => [0, ""])).toEqual([1, "x"]);
	});

	it("all collects ALL errors", () => {
		const result = Validated.all<string, number>([
			Validated.valid(1),
			Validated.invalid("too small"),
			Validated.invalid("odd"),
		]);
		expect(result.toResult()).toEqual(Result.error(["too small", "odd"]));
	});

	it("all returns Valid with every value when nothing fails", () => {
		const result = Validated.all<string, number>([
			Validated.valid(1),
			Validated.valid(2),
			Validated.valid(3),
		]);
		expect(result.toResult()).toEqual(Result.success([1, 2, 3]));
	});

	it("zipWith combines two validations", () => {
		const sum = Validated.zipWith(
			Validated.valid<number, string>(2),
			Validated.valid<number, string>(3),
			(a, b) => a + b,
		);
		expect(sum.getOrElse(() => 0)).toBe(5);
	});

	it("fromResult and toResult round-trip", () => {
		expect(
			Validated.fromResult(Result.success<number, string>(5)).toResult(),
		).toEqual(Result.success(5));
		expect(
			Validated.fromResult(Result.error<number, string>("x")).toResult(),
		).toEqual(Result.error(["x"]));
	});

	it("fromOption uses the fallback error on empty", () => {
		expect(
			Validated.fromOption(Option.value(7), "empty").getOrElse(() => 0),
		).toBe(7);
		expect(
			Validated.fromOption(Option.empty<number>(), "empty").toResult(),
		).toEqual(Result.error(["empty"]));
	});
});
