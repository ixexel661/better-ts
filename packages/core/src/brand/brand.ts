import { Option } from "../option/option.js";

// Phantom brand carrier: declared, never emitted, not exported, so a branded
// value can only be produced through the constructors below.
declare const brandTag: unique symbol;

/**
 * A nominal ("newtype") version of `T`, tagged with `B`. A `Brand<string, "UserId">`
 * is still assignable to `string`, but a plain `string` is not assignable back to
 * it, so illegal values cannot be represented (Rust newtype, Scala `opaque type`).
 *
 * @example
 * ```ts
 * type UserId = Brand<string, "UserId">
 * const UserId = Brand.nominal<UserId>()
 * const id = UserId("u_1") // UserId
 * fn(id)      // ok
 * fn("u_1")   // type error: not branded
 * ```
 */
export type Brand<T, B extends string | symbol> = T & {
	// Phantom carrier; the base type is stored structurally so `Unbrand` can read
	// it back by destructuring (intersection-`infer` would collapse to `T & tag`).
	readonly [brandTag]: readonly [T, B];
};

/** Recovers the underlying base type of a {@link Brand}. */
export type Unbrand<B> = B extends {
	readonly [brandTag]: readonly [infer T, string | symbol];
}
	? T
	: B;

/**
 * Builds a smart constructor for a branded type. At runtime it is the identity;
 * it only adds the nominal tag at the type level.
 *
 * @example
 * ```ts
 * type Email = Brand<string, "Email">
 * const Email = Brand.nominal<Email>()
 * const e = Email("a@b.de") // Email
 * ```
 */
function nominal<B extends Brand<unknown, string | symbol>>(): (
	value: Unbrand<B>,
) => B {
	return (value) => value as B;
}

/**
 * Builds a *validating* smart constructor: it returns the branded value when
 * `predicate` holds, otherwise an empty `Option`. Pairs the nominal guarantee
 * with a runtime check.
 *
 * @example
 * ```ts
 * type Even = Brand<number, "Even">
 * const Even = Brand.refine<Even>((n) => n % 2 === 0)
 * Even(4) // Option.value(4 as Even)
 * Even(3) // Option.empty()
 * ```
 */
function refine<B extends Brand<unknown, string | symbol>>(
	predicate: (value: Unbrand<B>) => boolean,
): (value: Unbrand<B>) => Option<B> {
	return (value) =>
		predicate(value) ? Option.value(value as B) : Option.empty();
}

/**
 * Helpers for {@link Brand}.
 *
 * - `nominal` — an unchecked smart constructor (identity at runtime).
 * - `refine` — a validating smart constructor returning an `Option`.
 */
export const Brand = {
	nominal,
	refine,
};
