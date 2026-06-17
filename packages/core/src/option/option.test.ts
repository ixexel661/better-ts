import { describe, expect, it } from "vitest";
import { None, Option, Some } from "./option.js";

describe("Option", () => {
	describe("Konstruktoren", () => {
		it("Some enthält einen Wert", () => {
			const o = Some(42);
			expect(o.isSome()).toBe(true);
			expect(o.isNone()).toBe(false);
		});

		it("None ist leer", () => {
			const o = None<number>();
			expect(o.isNone()).toBe(true);
			expect(o.isSome()).toBe(false);
		});

		it("fromNullable: null und undefined -> None", () => {
			expect(Option.fromNullable(null).isNone()).toBe(true);
			expect(Option.fromNullable(undefined).isNone()).toBe(true);
		});

		it("fromNullable: Wert -> Some", () => {
			const o = Option.fromNullable(0);
			expect(o.isSome()).toBe(true);
			expect(o.unwrap()).toBe(0);
		});
	});

	describe("Transformation", () => {
		it("map transformiert Some", () => {
			expect(
				Some(2)
					.map((x) => x * 3)
					.unwrap(),
			).toBe(6);
		});

		it("map auf None bleibt None", () => {
			expect(
				None<number>()
					.map((x) => x * 3)
					.isNone(),
			).toBe(true);
		});

		it("flatMap / andThen verkettet", () => {
			const half = (n: number): Option<number> =>
				n % 2 === 0 ? Some(n / 2) : None();
			expect(Some(8).flatMap(half).unwrap()).toBe(4);
			expect(Some(3).andThen(half).isNone()).toBe(true);
		});

		it("filter behält oder verwirft", () => {
			expect(
				Some(4)
					.filter((x) => x > 3)
					.isSome(),
			).toBe(true);
			expect(
				Some(2)
					.filter((x) => x > 3)
					.isNone(),
			).toBe(true);
		});

		it("tap führt Seiteneffekt aus und gibt this zurück", () => {
			let seen = 0;
			const o = Some(7).tap((x) => (seen = x));
			expect(seen).toBe(7);
			expect(o.unwrap()).toBe(7);
		});
	});

	describe("Extraktion", () => {
		it("unwrap wirft bei None", () => {
			expect(() => None().unwrap()).toThrow(/None/);
		});

		it("unwrapOr / unwrapOrElse", () => {
			expect(None<number>().unwrapOr(9)).toBe(9);
			expect(Some(1).unwrapOr(9)).toBe(1);
			expect(None<number>().unwrapOrElse(() => 5)).toBe(5);
		});

		it("toNullable / toUndefined", () => {
			expect(Some(1).toNullable()).toBe(1);
			expect(None().toNullable()).toBeNull();
			expect(None().toUndefined()).toBeUndefined();
		});

		it("match verzweigt", () => {
			const label = (o: Option<number>) =>
				o.match({ some: (x) => `some:${x}`, none: () => "none" });
			expect(label(Some(3))).toBe("some:3");
			expect(label(None())).toBe("none");
		});
	});

	describe("Interop -> Result", () => {
		it("okOr: Some -> Ok, None -> Err", () => {
			expect(Some(1).okOr("e").isOk()).toBe(true);
			const r = None<number>().okOr("e");
			expect(r.isErr()).toBe(true);
			expect(r.err().unwrap()).toBe("e");
		});

		it("okOrElse berechnet den Fehler verzögert", () => {
			expect(
				None<number>()
					.okOrElse(() => "lazy")
					.unwrapErr(),
			).toBe("lazy");
		});
	});

	describe("Narrowing", () => {
		it("isSome erlaubt Zugriff auf .value", () => {
			const o: Option<number> = Some(5);
			if (o.isSome()) {
				expect(o.value).toBe(5);
			} else {
				throw new Error("sollte Some sein");
			}
		});
	});
});
