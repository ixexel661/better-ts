import { describe, expect, expectTypeOf, it } from "vitest";
import type { DeepReadonly } from "../deep-readonly/deep-readonly.js";
import { type Immutable, immutable } from "./immutable.js";

describe("immutable", () => {
	it("freezes nested values recursively (like deepFreeze)", () => {
		const cfg = immutable({ user: { profile: { name: "Ada" } } });
		expect(Object.isFrozen(cfg)).toBe(true);
		expect(Object.isFrozen(cfg.user)).toBe(true);
		expect(Object.isFrozen(cfg.user.profile)).toBe(true);
	});

	it("a branded value stays readable as usual", () => {
		const cfg = immutable({ user: { name: "Ada" } });
		expect(cfg.user.name).toBe("Ada");
	});

	it("Immutable<T> is assignable to DeepReadonly (type level)", () => {
		type Config = { user: { name: string } };
		expectTypeOf<Immutable<Config>>().toMatchTypeOf<DeepReadonly<Config>>();
	});

	it("an unbranded value is NOT assignable to Immutable (type level)", () => {
		type Config = { user: { name: string } };
		const plain: DeepReadonly<Config> = { user: { name: "Ada" } };
		// @ts-expect-error: missing the Immutable brand; only `immutable()` produces it
		const branded: Immutable<Config> = plain;
		expect(branded.user.name).toBe("Ada");
	});
});
