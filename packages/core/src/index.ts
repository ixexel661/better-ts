/**
 * `@better-ts/core` a better standard library for TypeScript.
 *
 * Provides {@link Option}, {@link Result}, {@link Validated},
 * {@link NonEmptyArray}, {@link DeepReadonly}, {@link Immutable}, {@link Lazy},
 * {@link Brand} and {@link Iter} as zero-dependency building blocks.
 */

// Brand
export { Brand, type Unbrand } from "./brand/brand.js";
// DeepReadonly
export {
	type DeepReadonly,
	deepFreeze,
} from "./deep-readonly/deep-readonly.js";
// Immutable
export { type Immutable, immutable } from "./immutable/immutable.js";
// Iter
export { Iter } from "./iter/iter.js";
// Lazy
export { Lazy } from "./lazy/lazy.js";
// NonEmptyArray
export {
	NonEmptyArray,
	type ReadonlyNonEmptyArray,
} from "./non-empty-array/non-empty-array.js";
// Option
export {
	type Empty,
	Option,
	type OptionMatch,
	type Value,
} from "./option/option.js";
// Result
export {
	type Failure,
	Result,
	type ResultMatch,
	type Success,
} from "./result/result.js";
// Validated
export {
	type Invalid,
	type Valid,
	Validated,
	type ValidatedMatch,
} from "./validated/validated.js";
