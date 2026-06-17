import { describe, expect, it } from "vitest";
import { Err, Ok, Result } from "./result.js";

describe("Result", () => {
	describe("Konstruktoren", () => {
		it("Ok ist erfolgreich", () => {
			const r = Ok(1);
			expect(r.isOk()).toBe(true);
			expect(r.isErr()).toBe(false);
		});

		it("Err ist fehlerhaft", () => {
			const r = Err("boom");
			expect(r.isErr()).toBe(true);
			expect(r.isOk()).toBe(false);
		});
	});

	describe("tryCatch", () => {
		it("fängt Erfolg", () => {
			const r = Result.tryCatch(() => JSON.parse('{"a":1}'));
			expect(r.isOk()).toBe(true);
		});

		it("fängt geworfene Fehler als Err", () => {
			const r = Result.tryCatch(() => JSON.parse("{invalid"));
			expect(r.isErr()).toBe(true);
		});
	});

	describe("fromPromise", () => {
		it("resolve -> Ok", async () => {
			const r = await Result.fromPromise(Promise.resolve(42));
			expect(r.unwrap()).toBe(42);
		});

		it("reject -> Err", async () => {
			const r = await Result.fromPromise(Promise.reject(new Error("x")));
			expect(r.isErr()).toBe(true);
			expect((r.unwrapErr() as Error).message).toBe("x");
		});
	});

	describe("fromNullable", () => {
		it("Wert -> Ok, null/undefined -> Err", () => {
			expect(Result.fromNullable(0, "e").isOk()).toBe(true);
			expect(Result.fromNullable(null, "e").unwrapErr()).toBe("e");
			expect(Result.fromNullable(undefined, "e").isErr()).toBe(true);
		});
	});

	describe("Transformation", () => {
		it("map transformiert nur Ok", () => {
			expect(
				Ok<number, string>(2)
					.map((x) => x + 1)
					.unwrap(),
			).toBe(3);
			expect(
				Err<number, string>("e")
					.map((x) => x + 1)
					.isErr(),
			).toBe(true);
		});

		it("mapErr transformiert nur Err", () => {
			expect(
				Err<number, string>("e")
					.mapErr((e) => `${e}!`)
					.unwrapErr(),
			).toBe("e!");
			expect(
				Ok<number, string>(1)
					.mapErr((e) => `${e}!`)
					.isOk(),
			).toBe(true);
		});

		it("flatMap / andThen verkettet", () => {
			const positive = (n: number): Result<number, string> =>
				n > 0 ? Ok(n) : Err("not positive");
			expect(Ok<number, string>(5).andThen(positive).unwrap()).toBe(5);
			expect(Ok<number, string>(-1).andThen(positive).unwrapErr()).toBe(
				"not positive",
			);
		});

		it("tap / tapErr", () => {
			let ok = 0;
			let err = "";
			Ok<number, string>(3).tap((x) => (ok = x));
			Err<number, string>("e").tapErr((e) => (err = e));
			expect(ok).toBe(3);
			expect(err).toBe("e");
		});
	});

	describe("Extraktion", () => {
		it("unwrap wirft den Fehler bei Err", () => {
			expect(() => Err(new Error("nope")).unwrap()).toThrow("nope");
		});

		it("unwrapErr wirft bei Ok", () => {
			expect(() => Ok(1).unwrapErr()).toThrow(/Ok/);
		});

		it("unwrapOr / unwrapOrElse", () => {
			expect(Err<number, string>("e").unwrapOr(9)).toBe(9);
			expect(Err<number, string>("e").unwrapOrElse((e) => e.length)).toBe(1);
			expect(Ok<number, string>(1).unwrapOr(9)).toBe(1);
		});

		it("match verzweigt", () => {
			const fmt = (r: Result<number, string>) =>
				r.match({ ok: (x) => `ok:${x}`, err: (e) => `err:${e}` });
			expect(fmt(Ok(1))).toBe("ok:1");
			expect(fmt(Err("boom"))).toBe("err:boom");
		});
	});

	describe("Interop -> Option", () => {
		it("ok(): Ok -> Some, Err -> None", () => {
			expect(Ok<number, string>(1).ok().unwrap()).toBe(1);
			expect(Err<number, string>("e").ok().isNone()).toBe(true);
		});

		it("err(): Err -> Some, Ok -> None", () => {
			expect(Err<number, string>("e").err().unwrap()).toBe("e");
			expect(Ok<number, string>(1).err().isNone()).toBe(true);
		});
	});

	describe("Narrowing", () => {
		it("isOk erlaubt Zugriff auf .value", () => {
			const r: Result<number, string> = Ok(7);
			if (r.isOk()) {
				expect(r.value).toBe(7);
			} else {
				throw new Error("sollte Ok sein");
			}
		});

		it("isErr erlaubt Zugriff auf .error", () => {
			const r: Result<number, string> = Err("e");
			if (r.isErr()) {
				expect(r.error).toBe("e");
			} else {
				throw new Error("sollte Err sein");
			}
		});
	});
});
