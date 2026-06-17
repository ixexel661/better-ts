import { Option } from "../option/option.js";

/**
 * Handlers for {@link Result.match}.
 */
export interface ResultMatch<T, E, U> {
	success: (value: T) => U;
	error: (error: E) => U;
}

/**
 * Either a success ({@link Success}) holding a value, or a failure
 * ({@link Failure}) holding an error. A type-safe alternative to `throw` that
 * puts the error in the type signature where the caller can see it.
 *
 * @example
 * ```ts
 * const parsed = Result.tryCatch(() => JSON.parse(input))
 *   .map((data) => data.value)
 *   .getOrElse(() => 0)
 * ```
 */
export abstract class Result<T, E> {
	/** Discriminator that tells the two variants apart. */
	abstract readonly _tag: "Success" | "Failure";

	// --- Constructors / interop -------------------------------------------

	/** Wraps a success value. */
	static success<T, E = never>(value: T): Result<T, E> {
		return new SuccessImpl(value);
	}

	/** Wraps an error value. */
	static error<T = never, E = never>(error: E): Result<T, E> {
		return new FailureImpl(error);
	}

	/**
	 * Runs `fn` and captures anything it throws as a failure.
	 *
	 * @example
	 * ```ts
	 * Result.tryCatch(() => JSON.parse(s)) // Result<unknown, unknown>
	 * ```
	 */
	static tryCatch<T>(fn: () => T): Result<T, unknown> {
		try {
			return new SuccessImpl(fn());
		} catch (error) {
			return new FailureImpl(error);
		}
	}

	/**
	 * Awaits a promise: a fulfilled promise becomes a success, a rejected one a
	 * failure.
	 */
	static async fromPromise<T>(
		promise: PromiseLike<T>,
	): Promise<Result<T, unknown>> {
		try {
			return new SuccessImpl(await promise);
		} catch (error) {
			return new FailureImpl(error);
		}
	}

	/** A success for non-nullish values, otherwise a failure carrying `error`. */
	static fromNullable<T, E>(
		value: T | null | undefined,
		error: E,
	): Result<NonNullable<T>, E> {
		return value === null || value === undefined
			? new FailureImpl(error)
			: new SuccessImpl(value as NonNullable<T>);
	}

	// --- Type guards ------------------------------------------------------

	/** `true` on success (narrows to {@link Success}). */
	abstract isSuccess(): this is Success<T, E>;

	/** `true` on failure (narrows to {@link Failure}). */
	abstract isError(): this is Failure<T, E>;

	// --- Transformation ---------------------------------------------------

	/** Transforms the success value; a failure is left unchanged. */
	abstract map<U>(fn: (value: T) => U): Result<U, E>;

	/** Transforms the error value; a success is left unchanged. */
	abstract mapErr<F>(fn: (error: E) => F): Result<T, F>;

	/** Like {@link map}, but `fn` returns a `Result` itself. */
	abstract flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>;

	/** Runs `fn` for the success value (side effect) and returns `this`. */
	abstract tap(fn: (value: T) => void): this;

	/** Runs `fn` for the error value (side effect) and returns `this`. */
	abstract tapErr(fn: (error: E) => void): this;

	// --- Extraction -------------------------------------------------------

	/**
	 * Returns the success value, or throws the error.
	 * @throws the contained error `E` on failure.
	 */
	abstract getOrThrow(): T;

	/**
	 * Returns the error value, or throws on success.
	 * @throws {Error} on success.
	 */
	abstract getErrorOrThrow(): E;

	/** Returns the success value, or `onError(error)` on failure. */
	abstract getOrElse(onError: (error: E) => T): T;

	/** Returns the success value, or `null` on failure. */
	abstract getOrNull(): T | null;

	/** Returns the success value, or `undefined` on failure. */
	abstract getOrUndefined(): T | undefined;

	/** Branches on the variant. */
	abstract match<U>(cases: ResultMatch<T, E, U>): U;

	// --- Interop → Option -------------------------------------------------

	/** The success value as an `Option` (a failure becomes empty). */
	abstract toOption(): Option<T>;

	/** The error value as an `Option` (a success becomes empty). */
	abstract getError(): Option<E>;
}

/** The success variant of {@link Result}. */
class SuccessImpl<T, E> extends Result<T, E> {
	override readonly _tag = "Success" as const;

	constructor(readonly value: T) {
		super();
	}

	override isSuccess(): this is Success<T, E> {
		return true;
	}

	override isError(): this is Failure<T, E> {
		return false;
	}

	override map<U>(fn: (value: T) => U): Result<U, E> {
		return new SuccessImpl(fn(this.value));
	}

	override mapErr<F>(_fn: (error: E) => F): Result<T, F> {
		return this as unknown as Result<T, F>;
	}

	override flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
		return fn(this.value);
	}

	override tap(fn: (value: T) => void): this {
		fn(this.value);
		return this;
	}

	override tapErr(_fn: (error: E) => void): this {
		return this;
	}

	override getOrThrow(): T {
		return this.value;
	}

	override getErrorOrThrow(): never {
		throw new Error("Result.getErrorOrThrow() called on a successful Result");
	}

	override getOrElse(_onError: (error: E) => T): T {
		return this.value;
	}

	override getOrNull(): T | null {
		return this.value;
	}

	override getOrUndefined(): T | undefined {
		return this.value;
	}

	override match<U>(cases: ResultMatch<T, E, U>): U {
		return cases.success(this.value);
	}

	override toOption(): Option<T> {
		return Option.value(this.value);
	}

	override getError(): Option<E> {
		return Option.empty();
	}
}

/** The failure variant of {@link Result}. */
class FailureImpl<T, E> extends Result<T, E> {
	override readonly _tag = "Failure" as const;

	constructor(readonly error: E) {
		super();
	}

	override isSuccess(): this is Success<T, E> {
		return false;
	}

	override isError(): this is Failure<T, E> {
		return true;
	}

	override map<U>(_fn: (value: T) => U): Result<U, E> {
		return this as unknown as Result<U, E>;
	}

	override mapErr<F>(fn: (error: E) => F): Result<T, F> {
		return new FailureImpl(fn(this.error));
	}

	override flatMap<U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
		return this as unknown as Result<U, E>;
	}

	override tap(_fn: (value: T) => void): this {
		return this;
	}

	override tapErr(fn: (error: E) => void): this {
		fn(this.error);
		return this;
	}

	override getOrThrow(): never {
		throw this.error;
	}

	override getErrorOrThrow(): E {
		return this.error;
	}

	override getOrElse<U>(onError: (error: E) => U): U {
		return onError(this.error);
	}

	override getOrNull(): null {
		return null;
	}

	override getOrUndefined(): undefined {
		return undefined;
	}

	override match<U>(cases: ResultMatch<T, E, U>): U {
		return cases.error(this.error);
	}

	override toOption(): Option<T> {
		return Option.empty();
	}

	override getError(): Option<E> {
		return Option.value(this.error);
	}
}

/** The `Success` type: a successful {@link Result}. */
export type Success<T, E = never> = SuccessImpl<T, E>;

/** The `Failure` type: a failed {@link Result}. */
export type Failure<T, E = never> = FailureImpl<T, E>;
