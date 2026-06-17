import { describe, expect, it, vi } from "vitest";
import { Lazy } from "./lazy.js";

describe("Lazy", () => {
	it("evaluates the thunk exactly once", () => {
		const thunk = vi.fn(() => 42);
		const lazy = Lazy(thunk);

		expect(thunk).not.toHaveBeenCalled();
		expect(lazy.isEvaluated).toBe(false);

		expect(lazy.get()).toBe(42);
		expect(lazy.get()).toBe(42);

		expect(thunk).toHaveBeenCalledTimes(1);
		expect(lazy.isEvaluated).toBe(true);
	});

	it("map stays lazy until get()", () => {
		const thunk = vi.fn(() => 10);
		const mapped = Lazy(thunk).map((x) => x * 2);

		expect(thunk).not.toHaveBeenCalled();
		expect(mapped.get()).toBe(20);
		expect(thunk).toHaveBeenCalledTimes(1);
	});

	it("flatMap chains two Lazy values", () => {
		const result = Lazy(() => 3).flatMap((x) => Lazy(() => x + 4));
		expect(result.get()).toBe(7);
	});

	it("Lazy.of holds an already-computed value", () => {
		const lazy = Lazy.of(99);
		expect(lazy.isEvaluated).toBe(true);
		expect(lazy.get()).toBe(99);
	});
});
