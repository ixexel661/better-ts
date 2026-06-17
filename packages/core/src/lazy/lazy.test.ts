import { describe, expect, it, vi } from "vitest";
import { Lazy } from "./lazy.js";

describe("Lazy", () => {
	it("wertet den Thunk genau einmal aus", () => {
		const thunk = vi.fn(() => 42);
		const lazy = Lazy(thunk);

		expect(thunk).not.toHaveBeenCalled();
		expect(lazy.isEvaluated).toBe(false);

		expect(lazy.get()).toBe(42);
		expect(lazy.get()).toBe(42);

		expect(thunk).toHaveBeenCalledTimes(1);
		expect(lazy.isEvaluated).toBe(true);
	});

	it("map bleibt lazy bis get()", () => {
		const thunk = vi.fn(() => 10);
		const mapped = Lazy(thunk).map((x) => x * 2);

		expect(thunk).not.toHaveBeenCalled();
		expect(mapped.get()).toBe(20);
		expect(thunk).toHaveBeenCalledTimes(1);
	});

	it("flatMap verkettet zwei Lazy-Werte", () => {
		const result = Lazy(() => 3).flatMap((x) => Lazy(() => x + 4));
		expect(result.get()).toBe(7);
	});

	it("Lazy.of hält einen bereits berechneten Wert", () => {
		const lazy = Lazy.of(99);
		expect(lazy.isEvaluated).toBe(true);
		expect(lazy.get()).toBe(99);
	});
});
