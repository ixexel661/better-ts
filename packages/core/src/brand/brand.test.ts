import { describe, expect, it } from "vitest";
import { type Brand, brand, refine } from "./brand.js";

type UserId = Brand<string, "UserId">;
type Even = Brand<number, "Even">;

describe("brand", () => {
	it("ist zur Laufzeit die Identität", () => {
		const UserId = brand<UserId>();
		const id = UserId("u_1");
		expect(id).toBe("u_1");
	});

	it("ein gebrandeter Wert bleibt als Basistyp nutzbar", () => {
		const UserId = brand<UserId>();
		const id = UserId("u_42");
		expect(id.startsWith("u_")).toBe(true);
	});

	it("ein roher Basiswert ist NICHT dem Brand zuweisbar (Typ-Ebene)", () => {
		const raw = "u_1";
		// @ts-expect-error — fehlt das Brand; nur brand<UserId>() erzeugt es
		const id: UserId = raw;
		expect(id).toBe("u_1");
	});
});

describe("refine", () => {
	const Even = refine<Even>((n) => n % 2 === 0);

	it("gibt Some für einen gültigen Wert", () => {
		const result = Even(4);
		expect(result.isSome()).toBe(true);
		expect(result.unwrap()).toBe(4);
	});

	it("gibt None für einen ungültigen Wert", () => {
		expect(Even(3).isNone()).toBe(true);
	});
});
