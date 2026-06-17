import { describe, expect, it } from "vitest";
import { Brand } from "./brand.js";

type UserId = Brand<string, "UserId">;
type Even = Brand<number, "Even">;

describe("Brand.nominal", () => {
	it("is the identity at runtime", () => {
		const UserId = Brand.nominal<UserId>();
		const id = UserId("u_1");
		expect(id).toBe("u_1");
	});

	it("a branded value stays usable as its base type", () => {
		const UserId = Brand.nominal<UserId>();
		const id = UserId("u_42");
		expect(id.startsWith("u_")).toBe(true);
	});

	it("a raw base value is NOT assignable to the brand (type level)", () => {
		const raw = "u_1";
		// @ts-expect-error: missing the brand; only Brand.nominal<UserId>() produces it
		const id: UserId = raw;
		expect(id).toBe("u_1");
	});
});

describe("Brand.refine", () => {
	const Even = Brand.refine<Even>((n) => n % 2 === 0);

	it("returns a value for a valid input", () => {
		const result = Even(4);
		expect(result.hasValue()).toBe(true);
		expect(result.getOrThrow()).toBe(4);
	});

	it("is empty for an invalid input", () => {
		expect(Even(3).isEmpty()).toBe(true);
	});
});
