import { Option } from "../option/option.js";

/**
 * An array that is guaranteed at the type level to hold at least one element.
 *
 * @example
 * ```ts
 * const xs: NonEmptyArray<number> = [1, 2, 3]
 * const first = NonEmptyArray.first(xs) // number, never undefined
 * ```
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * The readonly variant of {@link NonEmptyArray}.
 */
export type ReadonlyNonEmptyArray<T> = readonly [T, ...T[]];

function isNonEmpty<T>(array: readonly T[]): array is NonEmptyArray<T> {
	return array.length > 0;
}

function fromArray<T>(array: readonly T[]): Option<NonEmptyArray<T>> {
	return isNonEmpty(array) ? Option.value(array) : Option.empty();
}

function of<T>(first: T, ...rest: T[]): NonEmptyArray<T> {
	return [first, ...rest];
}

function first<T>(array: ReadonlyNonEmptyArray<T>): T {
	return array[0];
}

function last<T>(array: ReadonlyNonEmptyArray<T>): T {
	return array[array.length - 1] as T;
}

function rest<T>(array: ReadonlyNonEmptyArray<T>): T[] {
	return array.slice(1);
}

function map<T, U>(
	array: ReadonlyNonEmptyArray<T>,
	fn: (value: T, index: number) => U,
): NonEmptyArray<U> {
	return array.map(fn) as unknown as NonEmptyArray<U>;
}

/**
 * Helpers for {@link NonEmptyArray}.
 *
 * - `isNonEmpty` — type guard that narrows a plain array.
 * - `fromArray` — safe construction, returning an `Option`.
 * - `of` — build one from at least one element.
 * - `first` / `last` — endpoints that always exist (no `| undefined`).
 * - `rest` — everything after the first element.
 * - `map` — like `Array.map`, but the result stays non-empty.
 *
 * @example
 * ```ts
 * NonEmptyArray.fromArray(userInput).match({
 *   value: (ne) => process(ne),
 *   empty: () => console.log("empty"),
 * })
 * ```
 */
export const NonEmptyArray = {
	isNonEmpty,
	fromArray,
	of,
	first,
	last,
	rest,
	map,
};
