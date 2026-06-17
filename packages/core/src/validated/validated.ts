import { NonEmptyArray } from "../non-empty-array/non-empty-array.js";
import type { Option } from "../option/option.js";
import { Result } from "../result/result.js";

/**
 * Handlers for {@link Validated.match}.
 */
export interface ValidatedMatch<E, A, U> {
	valid: (value: A) => U;
	invalid: (errors: NonEmptyArray<E>) => U;
}

/**
 * Like {@link Result}, but it **accumulates** errors instead of stopping at the
 * first one (the Cats `Validated`). Combining several validations keeps every
 * error, which is what you want for validating a form or a request. The error
 * channel is a {@link NonEmptyArray}, so an invalid result always carries at
 * least one error.
 *
 * @example
 * ```ts
 * Validated.all([validateName(n), validateAge(a)])
 * // invalid(["name empty", "age < 0"]): both errors, not just the first
 * ```
 */
export abstract class Validated<E, A> {
	/** Discriminator that tells the two variants apart. */
	abstract readonly _tag: "Valid" | "Invalid";

	// --- Constructors / interop -------------------------------------------

	/** Wraps a valid value. */
	static valid<A, E = never>(value: A): Validated<E, A> {
		return new ValidImpl(value);
	}

	/** Wraps a single error as an invalid result. */
	static invalid<E, A = never>(error: E): Validated<E, A> {
		return new InvalidImpl([error]);
	}

	/** A success becomes valid; a failure becomes invalid with that one error. */
	static fromResult<E, A>(result: Result<A, E>): Validated<E, A> {
		return result.match<Validated<E, A>>({
			success: (value) => new ValidImpl(value),
			error: (error) => new InvalidImpl([error]),
		});
	}

	/** A present option becomes valid; an empty one becomes invalid with `error`. */
	static fromOption<E, A>(option: Option<A>, error: E): Validated<E, A> {
		return option.match<Validated<E, A>>({
			value: (value) => new ValidImpl(value),
			empty: () => new InvalidImpl([error]),
		});
	}

	/**
	 * Combines many validations, keeping **all** errors. Returns the list of
	 * values only when every input is valid.
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
		return NonEmptyArray.isNonEmpty(errors)
			? new InvalidImpl(errors)
			: new ValidImpl(values);
	}

	/** Combines two validations with `fn`, keeping errors from both. */
	static zipWith<E, A, B, C>(
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

	/** Transforms the valid value; an invalid result is left unchanged. */
	abstract map<B>(fn: (value: A) => B): Validated<E, B>;

	/** Transforms every accumulated error; a valid result is left unchanged. */
	abstract mapErrors<F>(fn: (error: E) => F): Validated<F, A>;

	/**
	 * Combines with another validation. Both valid produces `[a, b]`; otherwise
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

	/**
	 * Returns the valid value, or throws the accumulated errors.
	 * @throws the contained `NonEmptyArray<E>` when invalid.
	 */
	abstract getOrThrow(): A;

	/** Returns the valid value, or `onInvalid(errors)` when invalid. */
	abstract getOrElse(onInvalid: (errors: NonEmptyArray<E>) => A): A;

	/** Branches on the variant. */
	abstract match<U>(cases: ValidatedMatch<E, A, U>): U;

	// --- Interop → Result -------------------------------------------------

	/** Turns this into a `Result` with the errors on the failure side. */
	abstract toResult(): Result<A, NonEmptyArray<E>>;
}

/** The valid variant of {@link Validated}. */
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

	override getOrThrow(): A {
		return this.value;
	}

	override getOrElse(_onInvalid: (errors: NonEmptyArray<E>) => A): A {
		return this.value;
	}

	override match<U>(cases: ValidatedMatch<E, A, U>): U {
		return cases.valid(this.value);
	}

	override toResult(): Result<A, NonEmptyArray<E>> {
		return Result.success(this.value);
	}
}

/** The invalid variant of {@link Validated}; carries one or more errors. */
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
		return new InvalidImpl(NonEmptyArray.map(this.errors, fn));
	}

	override getOrThrow(): never {
		throw this.errors;
	}

	override getOrElse<B>(onInvalid: (errors: NonEmptyArray<E>) => B): B {
		return onInvalid(this.errors);
	}

	override match<U>(cases: ValidatedMatch<E, A, U>): U {
		return cases.invalid(this.errors);
	}

	override toResult(): Result<A, NonEmptyArray<E>> {
		return Result.error(this.errors);
	}
}

/** The `Valid` type: a {@link Validated} that holds a value. */
export type Valid<A, E = never> = ValidImpl<E, A>;

/** The `Invalid` type: a {@link Validated} that holds accumulated errors. */
export type Invalid<E, A = never> = InvalidImpl<E, A>;
