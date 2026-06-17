import { describe, expect, it } from "vitest";
import { Result } from "./result.js";

describe("Result", () => {
	describe("Constructors", () => {
		it("success is successful", () => {
			const r = Result.success(1);
			expect(r.isSuccess()).toBe(true);
			expect(r.isError()).toBe(false);
		});

		it("error is a failure", () => {
			const r = Result.error("boom");
			expect(r.isError()).toBe(true);
			expect(r.isSuccess()).toBe(false);
		});
	});

	describe("tryCatch", () => {
		it("catches success", () => {
			const r = Result.tryCatch(() => JSON.parse('{"a":1}'));
			expect(r.isSuccess()).toBe(true);
		});

		it("catches thrown errors as a failure", () => {
			const r = Result.tryCatch(() => JSON.parse("{invalid"));
			expect(r.isError()).toBe(true);
		});
	});

	describe("fromPromise", () => {
		it("resolve -> success", async () => {
			const r = await Result.fromPromise(Promise.resolve(42));
			expect(r.getOrThrow()).toBe(42);
		});

		it("reject -> error", async () => {
			const r = await Result.fromPromise(Promise.reject(new Error("x")));
			expect(r.isError()).toBe(true);
			expect((r.getErrorOrThrow() as Error).message).toBe("x");
		});
	});

	describe("fromNullable", () => {
		it("a value -> success, null/undefined -> error", () => {
			expect(Result.fromNullable(0, "e").isSuccess()).toBe(true);
			expect(Result.fromNullable(null, "e").getErrorOrThrow()).toBe("e");
			expect(Result.fromNullable(undefined, "e").isError()).toBe(true);
		});
	});

	describe("Transformation", () => {
		it("map transforms only success", () => {
			expect(
				Result.success<number, string>(2)
					.map((x) => x + 1)
					.getOrThrow(),
			).toBe(3);
			expect(
				Result.error<number, string>("e")
					.map((x) => x + 1)
					.isError(),
			).toBe(true);
		});

		it("mapErr transforms only the error", () => {
			expect(
				Result.error<number, string>("e")
					.mapErr((e) => `${e}!`)
					.getErrorOrThrow(),
			).toBe("e!");
			expect(
				Result.success<number, string>(1)
					.mapErr((e) => `${e}!`)
					.isSuccess(),
			).toBe(true);
		});

		it("flatMap chains", () => {
			const positive = (n: number): Result<number, string> =>
				n > 0 ? Result.success(n) : Result.error("not positive");
			expect(
				Result.success<number, string>(5).flatMap(positive).getOrThrow(),
			).toBe(5);
			expect(
				Result.success<number, string>(-1).flatMap(positive).getErrorOrThrow(),
			).toBe("not positive");
		});

		it("tap / tapErr", () => {
			let ok = 0;
			let err = "";
			Result.success<number, string>(3).tap((x) => (ok = x));
			Result.error<number, string>("e").tapErr((e) => (err = e));
			expect(ok).toBe(3);
			expect(err).toBe("e");
		});
	});

	describe("Extraction", () => {
		it("getOrThrow throws the error on a failure", () => {
			expect(() => Result.error(new Error("nope")).getOrThrow()).toThrow(
				"nope",
			);
		});

		it("getErrorOrThrow throws on success", () => {
			expect(() => Result.success(1).getErrorOrThrow()).toThrow(/success/);
		});

		it("getOrElse", () => {
			expect(Result.error<number, string>("e").getOrElse(() => 9)).toBe(9);
			expect(Result.error<number, string>("e").getOrElse((e) => e.length)).toBe(
				1,
			);
			expect(Result.success<number, string>(1).getOrElse(() => 9)).toBe(1);
		});

		it("match branches", () => {
			const fmt = (r: Result<number, string>) =>
				r.match({ success: (x) => `ok:${x}`, error: (e) => `err:${e}` });
			expect(fmt(Result.success(1))).toBe("ok:1");
			expect(fmt(Result.error("boom"))).toBe("err:boom");
		});
	});

	describe("Interop -> Option", () => {
		it("toOption: success -> value, error -> empty", () => {
			expect(Result.success<number, string>(1).toOption().getOrThrow()).toBe(1);
			expect(Result.error<number, string>("e").toOption().isEmpty()).toBe(true);
		});

		it("getError: error -> value, success -> empty", () => {
			expect(Result.error<number, string>("e").getError().getOrThrow()).toBe(
				"e",
			);
			expect(Result.success<number, string>(1).getError().isEmpty()).toBe(true);
		});
	});

	describe("Narrowing", () => {
		it("isSuccess allows access to .value", () => {
			const r: Result<number, string> = Result.success(7);
			if (r.isSuccess()) {
				expect(r.value).toBe(7);
			} else {
				throw new Error("should be a success");
			}
		});

		it("isError allows access to .error", () => {
			const r: Result<number, string> = Result.error("e");
			if (r.isError()) {
				expect(r.error).toBe("e");
			} else {
				throw new Error("should be a failure");
			}
		});
	});
});
