import { describe, expect, it } from "vitest";
import { Option } from "./option.js";

describe("Option", () => {
	describe("Constructors", () => {
		it("value holds a value", () => {
			const o = Option.value(42);
			expect(o.hasValue()).toBe(true);
			expect(o.isEmpty()).toBe(false);
		});

		it("empty is empty", () => {
			const o = Option.empty<number>();
			expect(o.isEmpty()).toBe(true);
			expect(o.hasValue()).toBe(false);
		});

		it("fromNullable: null and undefined -> empty", () => {
			expect(Option.fromNullable(null).isEmpty()).toBe(true);
			expect(Option.fromNullable(undefined).isEmpty()).toBe(true);
		});

		it("fromNullable: a value -> value", () => {
			const o = Option.fromNullable(0);
			expect(o.hasValue()).toBe(true);
			expect(o.getOrThrow()).toBe(0);
		});
	});

	describe("Transformation", () => {
		it("map transforms a present value", () => {
			expect(
				Option.value(2)
					.map((x) => x * 3)
					.getOrThrow(),
			).toBe(6);
		});

		it("map on empty stays empty", () => {
			expect(
				Option.empty<number>()
					.map((x) => x * 3)
					.isEmpty(),
			).toBe(true);
		});

		it("flatMap chains", () => {
			const half = (n: number): Option<number> =>
				n % 2 === 0 ? Option.value(n / 2) : Option.empty();
			expect(Option.value(8).flatMap(half).getOrThrow()).toBe(4);
			expect(Option.value(3).flatMap(half).isEmpty()).toBe(true);
		});

		it("filter keeps or discards", () => {
			expect(
				Option.value(4)
					.filter((x) => x > 3)
					.hasValue(),
			).toBe(true);
			expect(
				Option.value(2)
					.filter((x) => x > 3)
					.isEmpty(),
			).toBe(true);
		});

		it("tap runs a side effect and returns this", () => {
			let seen = 0;
			const o = Option.value(7).tap((x) => (seen = x));
			expect(seen).toBe(7);
			expect(o.getOrThrow()).toBe(7);
		});
	});

	describe("Extraction", () => {
		it("getOrThrow throws on empty", () => {
			expect(() => Option.empty().getOrThrow()).toThrow(/empty/);
		});

		it("getOrElse", () => {
			expect(Option.empty<number>().getOrElse(() => 9)).toBe(9);
			expect(Option.value(1).getOrElse(() => 9)).toBe(1);
		});

		it("getOrNull / getOrUndefined", () => {
			expect(Option.value(1).getOrNull()).toBe(1);
			expect(Option.empty().getOrNull()).toBeNull();
			expect(Option.empty().getOrUndefined()).toBeUndefined();
		});

		it("match branches", () => {
			const label = (o: Option<number>) =>
				o.match({ value: (x) => `value:${x}`, empty: () => "empty" });
			expect(label(Option.value(3))).toBe("value:3");
			expect(label(Option.empty())).toBe("empty");
		});
	});

	describe("Interop -> Result", () => {
		it("toResult: value -> success, empty -> error", () => {
			expect(
				Option.value(1)
					.toResult(() => "e")
					.isSuccess(),
			).toBe(true);
			const r = Option.empty<number>().toResult(() => "e");
			expect(r.isError()).toBe(true);
			expect(r.getError().getOrThrow()).toBe("e");
		});

		it("toResult computes the error lazily", () => {
			expect(
				Option.empty<number>()
					.toResult(() => "lazy")
					.getErrorOrThrow(),
			).toBe("lazy");
		});
	});

	describe("Narrowing", () => {
		it("hasValue allows access to .value", () => {
			const o: Option<number> = Option.value(5);
			if (o.hasValue()) {
				expect(o.value).toBe(5);
			} else {
				throw new Error("should have a value");
			}
		});
	});
});
