import { describe, expect, expectTypeOf, it } from "vitest";
import { type DeepReadonly, deepFreeze } from "./deep-readonly.js";

describe("deepFreeze", () => {
	it("friert verschachtelte Objekte rekursiv ein", () => {
		const obj = deepFreeze({ user: { profile: { name: "Ada" } } });
		expect(Object.isFrozen(obj)).toBe(true);
		expect(Object.isFrozen(obj.user)).toBe(true);
		expect(Object.isFrozen(obj.user.profile)).toBe(true);
	});

	it("friert verschachtelte Arrays ein", () => {
		const arr = deepFreeze([{ a: 1 }, { a: 2 }]);
		expect(Object.isFrozen(arr)).toBe(true);
		expect(Object.isFrozen(arr[0])).toBe(true);
	});

	it("verhindert Mutation im strict mode", () => {
		const obj = deepFreeze({ a: { b: 1 } });
		expect(() => {
			// @ts-expect-error — readonly
			obj.a.b = 2;
		}).toThrow();
	});

	it("ist zyklensicher", () => {
		const a: Record<string, unknown> = { name: "a" };
		a.self = a;
		const frozen = deepFreeze(a);
		expect(Object.isFrozen(frozen)).toBe(true);
	});

	it("friert Map- und Set-Inhalte ein", () => {
		const map = deepFreeze(new Map([["k", { v: 1 }]]));
		expect(Object.isFrozen(map)).toBe(true);
		expect(Object.isFrozen(map.get("k"))).toBe(true);

		const inner = { v: 2 };
		const set = deepFreeze(new Set([inner]));
		expect(Object.isFrozen(set)).toBe(true);
		expect(Object.isFrozen(inner)).toBe(true);
	});

	it("Primitive werden unverändert zurückgegeben", () => {
		expect(deepFreeze(42)).toBe(42);
		expect(deepFreeze("x")).toBe("x");
		expect(deepFreeze(null)).toBeNull();
	});

	it("DeepReadonly macht jede Ebene readonly (Typ-Ebene)", () => {
		type Config = DeepReadonly<{ user: { tags: string[] } }>;
		expectTypeOf<Config>().toEqualTypeOf<{
			readonly user: { readonly tags: ReadonlyArray<string> };
		}>();
	});
});
