import type { Option } from "../option/option.js";
import { None, Some } from "../option/option.js";

// Phantom brand carrier — declared, never emitted, not exported, so a branded
// value can only be produced through the constructors below.
declare const brandTag: unique symbol;

/**
 * A nominal ("newtype") version of `T`, tagged with `B`. A `Brand<string, "UserId">`
 * is assignable to `string`, but a plain `string` is NOT assignable to it — so
 * illegal values become unrepresentable (Rust newtype / Scala `opaque type`).
 *
 * @example
 * ```ts
 * type UserId = Brand<string, "UserId">
 * const UserId = brand<UserId>()
 * const id = UserId("u_1") // UserId
 * fn(id)      // ok
 * fn("u_1")   // type error — not branded
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
 * Creates a smart constructor for a branded type. The constructor is the
 * identity at runtime; it only adds the nominal tag at the type level.
 *
 * @example
 * ```ts
 * type Email = Brand<string, "Email">
 * const Email = brand<Email>()
 * const e = Email("a@b.de") // Email
 * ```
 */
export function brand<B extends Brand<unknown, string | symbol>>(): (
	value: Unbrand<B>,
) => B {
	return (value) => value as B;
}

/**
 * Creates a *validating* smart constructor: returns `Some(branded)` when
 * `predicate` holds, otherwise `None`. Pairs the nominal guarantee with a
 * runtime check.
 *
 * @example
 * ```ts
 * type Even = Brand<number, "Even">
 * const Even = refine<Even>((n) => n % 2 === 0)
 * Even(4) // Some(4 as Even)
 * Even(3) // None
 * ```
 */
export function refine<B extends Brand<unknown, string | symbol>>(
	predicate: (value: Unbrand<B>) => boolean,
): (value: Unbrand<B>) => Option<B> {
	return (value) => (predicate(value) ? Some(value as B) : None());
}
