/**
 * `@better-ts/core` a better standard library for TypeScript.
 *
 * Provides {@link Option}, {@link Result}, {@link Validated},
 * {@link NonEmptyArray}, {@link DeepReadonly}, {@link Immutable}, {@link Lazy},
 * {@link Brand} and {@link Iter} as zero-dependency building blocks.
 */

// Brand
export { type Brand, brand, refine, type Unbrand } from "./brand/brand.js";
// DeepReadonly
export {
	type DeepReadonly,
	deepFreeze,
} from "./deep-readonly/deep-readonly.js";
// Immutable
export { type Immutable, immutable } from "./immutable/immutable.js";
// Iter
export { Iter, range } from "./iter/iter.js";
// Lazy
export { Lazy } from "./lazy/lazy.js";
// NonEmptyArray
export {
	head,
	isNonEmpty,
	last,
	mapNonEmpty,
	type NonEmptyArray,
	nonEmpty,
	of,
	type ReadonlyNonEmptyArray,
	tail,
} from "./non-empty-array/non-empty-array.js";
// Option
export {
	None,
	Option,
	type OptionMatch,
	Some,
} from "./option/option.js";
// Result
export {
	Err,
	Ok,
	Result,
	type ResultMatch,
} from "./result/result.js";
// Validated
export {
	Invalid,
	Valid,
	Validated,
	type ValidatedMatch,
} from "./validated/validated.js";
