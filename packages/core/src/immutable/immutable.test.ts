import { describe, expect, expectTypeOf, it } from "vitest";
import type { DeepReadonly } from "../deep-readonly/deep-readonly.js";
import { type Immutable, immutable } from "./immutable.js";

describe("immutable", () => {
	it("friert verschachtelte Werte rekursiv ein (wie deepFreeze)", () => {
		const cfg = immutable({ user: { profile: { name: "Ada" } } });
		expect(Object.isFrozen(cfg)).toBe(true);
		expect(Object.isFrozen(cfg.user)).toBe(true);
		expect(Object.isFrozen(cfg.user.profile)).toBe(true);
	});

	it("ein gebrandeter Wert bleibt normal lesbar", () => {
		const cfg = immutable({ user: { name: "Ada" } });
		expect(cfg.user.name).toBe("Ada");
	});

	it("Immutable<T> ist DeepReadonly-zuweisbar (Typ-Ebene)", () => {
		type Config = { user: { name: string } };
		expectTypeOf<Immutable<Config>>().toMatchTypeOf<DeepReadonly<Config>>();
	});

	it("ein ungebrandeter Wert ist NICHT Immutable-zuweisbar (Typ-Ebene)", () => {
		type Config = { user: { name: string } };
		const plain: DeepReadonly<Config> = { user: { name: "Ada" } };
		// @ts-expect-error — fehlt das Immutable-Brand; nur `immutable()` erzeugt es
		const branded: Immutable<Config> = plain;
		expect(branded.user.name).toBe("Ada");
	});
});
