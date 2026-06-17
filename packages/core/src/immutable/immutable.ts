import {
	type DeepReadonly,
	deepFreeze,
} from "../deep-readonly/deep-readonly.js";

// Phantom brand: declared, never emitted, not exported, so an `Immutable<T>`
// can only be produced through `immutable()` below.
declare const immutableBrand: unique symbol;

/**
 * A value that has been deeply frozen at runtime. Strictly more informative
 * than {@link DeepReadonly}: the brand proves the value went through
 * {@link immutable}, so a plain readonly-shaped object is NOT assignable here.
 *
 * @example
 * ```ts
 * function render(cfg: Immutable<Config>) {} // guaranteed runtime-frozen
 * render(immutable(config))                  // ok
 * render(config)                             // type error: not branded
 * ```
 */
export type Immutable<T> = DeepReadonly<T> & {
	readonly [immutableBrand]: true;
};

/**
 * Deeply freezes a value and returns it as a branded {@link Immutable}. Unlike
 * {@link deepFreeze} (which yields the structural {@link DeepReadonly} view),
 * the result carries a type-level proof that it was actually frozen at runtime.
 *
 * @example
 * ```ts
 * const cfg = immutable({ user: { name: 'Ada' } }) // Immutable<{ user: ... }>
 * ```
 */
export function immutable<T>(value: T): Immutable<T> {
	return deepFreeze(value) as Immutable<T>;
}
