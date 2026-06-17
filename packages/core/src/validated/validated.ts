import {
	isNonEmpty,
	mapNonEmpty,
	type NonEmptyArray,
} from "../non-empty-array/non-empty-array.js";
import type { Option } from "../option/option.js";
import type { Result } from "../result/result.js";
import { Err, Ok } from "../result/result.js";

/**
 * Pattern for {@link Validated.match}.
 */
export interface ValidatedMatch<E, A, U> {
	valid: (value: A) => U;
	invalid: (errors: NonEmptyArray<E>) => U;
}

/**
 * Like {@link Result}, but **accumulates** errors instead of short-circuiting on
 * the first one (Cats `Validated`). Combining several validations collects every
 * error, which makes it ideal for form/input validation. The error channel is a
 * {@link NonEmptyArray} so an `Invalid` always carries at least one error.
 *
 * @example
 * ```ts
 * Validated.all([validateName(n), validateAge(a)])
 * // Invalid(["name empty", "age < 0"]) — both errors, not just the first
 * ```
 */
export abstract class Validated<E, A> {
	/** Discriminator used to tell the variants apart. */
	abstract readonly _tag: "Valid" | "Invalid";

	// --- Constructors / interop -------------------------------------------

	/** Creates a {@link Valid}. */
	static valid<A, E = never>(value: A): Validated<E, A> {
		return new ValidImpl(value);
	}

	/** Creates an {@link Invalid} with a single error. */
	static invalid<E, A = never>(error: E): Validated<E, A> {
		return new InvalidImpl([error]);
	}

	/** `Ok -> Valid`, `Err -> Invalid([error])`. */
	static fromResult<E, A>(result: Result<A, E>): Validated<E, A> {
		return result.match<Validated<E, A>>({
			ok: (value) => new ValidImpl(value),
			err: (error) => new InvalidImpl([error]),
		});
	}

	/** `Some -> Valid`, `None -> Invalid([error])`. */
	static fromOption<E, A>(option: Option<A>, error: E): Validated<E, A> {
		return option.match<Validated<E, A>>({
			some: (value) => new ValidImpl(value),
			none: () => new InvalidImpl([error]),
		});
	}

	/**
	 * Combines many validations, accumulating **all** errors. Returns
	 * `Valid(values)` only when every input is valid.
	 */
	static all<E, A>(validations: readonly Validated<E, A>[]): Validated<E, A[]> {
		const values: A[] = [];
		const errors: E[] = [];
		for (const validation of validations) {
			validation.match({
				valid: (value) => values.push(value),
				invalid: (errs) => errors.push(...errs),
			});
		}
		return isNonEmpty(errors) ? new InvalidImpl(errors) : new ValidImpl(values);
	}

	/** Combines two validations with `fn`, accumulating errors from both. */
	static map2<E, A, B, C>(
		va: Validated<E, A>,
		vb: Validated<E, B>,
		fn: (a: A, b: B) => C,
	): Validated<E, C> {
		return va.zip(vb).map(([a, b]) => fn(a, b));
	}

	// --- Type guards ------------------------------------------------------

	/** `true` on success (narrows to {@link Valid}). */
	abstract isValid(): this is Valid<A, E>;

	/** `true` on failure (narrows to {@link Invalid}). */
	abstract isInvalid(): this is Invalid<E, A>;

	// --- Transformation ---------------------------------------------------

	/** Transforms the valid value; `Invalid` is left unchanged. */
	abstract map<B>(fn: (value: A) => B): Validated<E, B>;

	/** Transforms every accumulated error; `Valid` is left unchanged. */
	abstract mapErrors<F>(fn: (error: E) => F): Validated<F, A>;

	/**
	 * Combines with another validation. Both valid → `Valid([a, b])`; otherwise
	 * the errors of both sides are concatenated.
	 */
	zip<B>(other: Validated<E, B>): Validated<E, [A, B]> {
		return this.match<Validated<E, [A, B]>>({
			valid: (a) => other.map((b) => [a, b]),
			invalid: (e1) =>
				other.match<Validated<E, [A, B]>>({
					valid: () => new InvalidImpl(e1),
					invalid: (e2) => new InvalidImpl([...e1, ...e2]),
				}),
		});
	}

	// --- Extraction -------------------------------------------------------

	/** Valid value or `fallback`. */
	abstract getOrElse(fallback: A): A;

	/** Branches depending on the variant. */
	abstract match<U>(cases: ValidatedMatch<E, A, U>): U;

	// --- Interop → Result -------------------------------------------------

	/** `Valid -> Ok(value)`, `Invalid -> Err(errors)`. */
	abstract toResult(): Result<A, NonEmptyArray<E>>;
}

/** Success variant of {@link Validated}. */
class ValidImpl<E, A> extends Validated<E, A> {
	override readonly _tag = "Valid" as const;

	constructor(readonly value: A) {
		super();
	}

	override isValid(): this is Valid<A, E> {
		return true;
	}

	override isInvalid(): this is Invalid<E, A> {
		return false;
	}

	override map<B>(fn: (value: A) => B): Validated<E, B> {
		return new ValidImpl(fn(this.value));
	}

	override mapErrors<F>(_fn: (error: E) => F): Validated<F, A> {
		return this as unknown as Validated<F, A>;
	}

	override getOrElse(_fallback: A): A {
		return this.value;
	}

	override match<U>(cases: ValidatedMatch<E, A, U>): U {
		return cases.valid(this.value);
	}

	override toResult(): Result<A, NonEmptyArray<E>> {
		return Ok(this.value);
	}
}

/** Failure variant of {@link Validated}; carries one or more errors. */
class InvalidImpl<E, A> extends Validated<E, A> {
	override readonly _tag = "Invalid" as const;

	constructor(readonly errors: NonEmptyArray<E>) {
		super();
	}

	override isValid(): this is Valid<A, E> {
		return false;
	}

	override isInvalid(): this is Invalid<E, A> {
		return true;
	}

	override map<B>(_fn: (value: A) => B): Validated<E, B> {
		return this as unknown as Validated<E, B>;
	}

	override mapErrors<F>(fn: (error: E) => F): Validated<F, A> {
		return new InvalidImpl(mapNonEmpty(this.errors, fn));
	}

	override getOrElse(fallback: A): A {
		return fallback;
	}

	override match<U>(cases: ValidatedMatch<E, A, U>): U {
		return cases.invalid(this.errors);
	}

	override toResult(): Result<A, NonEmptyArray<E>> {
		return Err(this.errors);
	}
}

/** The `Valid` type: a {@link Validated} that holds a value. */
export type Valid<A, E = never> = ValidImpl<E, A>;

/** The `Invalid` type: a {@link Validated} that holds accumulated errors. */
export type Invalid<E, A = never> = InvalidImpl<E, A>;

/**
 * Creates a {@link Valid}.
 *
 * @example
 * ```ts
 * Valid(42) // Validated<never, number>
 * ```
 */
export function Valid<A, E = never>(value: A): Validated<E, A> {
	return new ValidImpl(value);
}

/**
 * Creates an {@link Invalid} with a single error.
 *
 * @example
 * ```ts
 * Invalid("name is required") // Validated<string, never>
 * ```
 */
export function Invalid<E, A = never>(error: E): Validated<E, A> {
	return new InvalidImpl([error]);
}
