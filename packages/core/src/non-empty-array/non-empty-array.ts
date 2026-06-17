import type { Option } from "../option/option.js";
import { None, Some } from "../option/option.js";

/**
 * An array that is guaranteed at the type level to contain at least one element.
 *
 * @example
 * ```ts
 * const xs: NonEmptyArray<number> = [1, 2, 3]
 * const first = head(xs) // number — no `| undefined`
 * ```
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Read-only variant of {@link NonEmptyArray}.
 */
export type ReadonlyNonEmptyArray<T> = readonly [T, ...T[]];

/**
 * Type guard: checks whether an array is non-empty and narrows accordingly.
 *
 * @example
 * ```ts
 * if (isNonEmpty(xs)) {
 *   head(xs) // allowed — xs is NonEmptyArray<T>
 * }
 * ```
 */
export function isNonEmpty<T>(array: readonly T[]): array is NonEmptyArray<T> {
	return array.length > 0;
}

/**
 * Safe construction: `Some(array)` when non-empty, otherwise `None`.
 *
 * @example
 * ```ts
 * nonEmpty([1, 2]) // Option<NonEmptyArray<number>>
 * nonEmpty([])     // None
 * ```
 */
export function nonEmpty<T>(array: readonly T[]): Option<NonEmptyArray<T>> {
	return isNonEmpty(array) ? Some(array) : None();
}

/**
 * Creates a {@link NonEmptyArray} from at least one element.
 *
 * @example
 * ```ts
 * of(1, 2, 3) // NonEmptyArray<number>
 * ```
 */
export function of<T>(first: T, ...rest: T[]): NonEmptyArray<T> {
	return [first, ...rest];
}

/**
 * The first element — guaranteed to exist, hence without `| undefined`.
 */
export function head<T>(array: ReadonlyNonEmptyArray<T>): T {
	return array[0];
}

/**
 * The last element — guaranteed to exist.
 */
export function last<T>(array: ReadonlyNonEmptyArray<T>): T {
	return array[array.length - 1] as T;
}

/**
 * All elements except the first (may be empty).
 */
export function tail<T>(array: ReadonlyNonEmptyArray<T>): T[] {
	return array.slice(1);
}

/**
 * Like `Array.prototype.map`, but preserves non-emptiness at the type level.
 *
 * @example
 * ```ts
 * mapNonEmpty([1, 2, 3], (x) => x * 2) // NonEmptyArray<number>
 * ```
 */
export function mapNonEmpty<T, U>(
	array: ReadonlyNonEmptyArray<T>,
	fn: (value: T, index: number) => U,
): NonEmptyArray<U> {
	return array.map(fn) as unknown as NonEmptyArray<U>;
}
