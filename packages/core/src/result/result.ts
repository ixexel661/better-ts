import type { Option } from "../option/option.js";
import { None, Some } from "../option/option.js";

/**
 * Pattern for {@link Result.match}.
 */
export interface ResultMatch<T, E, U> {
	ok: (value: T) => U;
	err: (error: E) => U;
}

/**
 * Represents either a success ({@link Ok}) holding a value or a failure
 * ({@link Err}) holding an error value. A type-safe alternative to `throw` that
 * makes errors visible in the type system.
 *
 * @example
 * ```ts
 * const parsed = Result.tryCatch(() => JSON.parse(input))
 *   .map((data) => data.value)
 *   .unwrapOr(0)
 * ```
 */
export abstract class Result<T, E> {
	/** Discriminator used to tell the variants apart. */
	abstract readonly _tag: "Ok" | "Err";

	// --- Constructors / interop -------------------------------------------

	/** Creates an {@link Ok}. */
	static ok<T, E = never>(value: T): Result<T, E> {
		return new OkImpl(value);
	}

	/** Creates an {@link Err}. */
	static err<T = never, E = never>(error: E): Result<T, E> {
		return new ErrImpl(error);
	}

	/**
	 * Runs `fn` and captures thrown errors as `Err`.
	 *
	 * @example
	 * ```ts
	 * Result.tryCatch(() => JSON.parse(s)) // Result<unknown, unknown>
	 * ```
	 */
	static tryCatch<T>(fn: () => T): Result<T, unknown> {
		try {
			return new OkImpl(fn());
		} catch (error) {
			return new ErrImpl(error);
		}
	}

	/**
	 * Awaits a promise and wraps the outcome: fulfilled → `Ok`,
	 * rejected → `Err`.
	 */
	static async fromPromise<T>(
		promise: PromiseLike<T>,
	): Promise<Result<T, unknown>> {
		try {
			return new OkImpl(await promise);
		} catch (error) {
			return new ErrImpl(error);
		}
	}

	/** `Ok(value)` for non-nullish values, otherwise `Err(error)`. */
	static fromNullable<T, E>(
		value: T | null | undefined,
		error: E,
	): Result<NonNullable<T>, E> {
		return value === null || value === undefined
			? new ErrImpl(error)
			: new OkImpl(value as NonNullable<T>);
	}

	// --- Type guards ------------------------------------------------------

	/** `true` on success (narrows to {@link Ok}). */
	abstract isOk(): this is Ok<T, E>;

	/** `true` on failure (narrows to {@link Err}). */
	abstract isErr(): this is Err<T, E>;

	// --- Transformation ---------------------------------------------------

	/** Transforms the success value; `Err` is left unchanged. */
	abstract map<U>(fn: (value: T) => U): Result<U, E>;

	/** Transforms the error value; `Ok` is left unchanged. */
	abstract mapErr<F>(fn: (error: E) => F): Result<T, F>;

	/** Like {@link map}, but `fn` returns a `Result` itself. */
	abstract flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>;

	/** Alias for {@link flatMap}. */
	andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
		return this.flatMap(fn);
	}

	/** Runs `fn` for the success value (side effect), returns `this`. */
	abstract tap(fn: (value: T) => void): this;

	/** Runs `fn` for the error value (side effect), returns `this`. */
	abstract tapErr(fn: (error: E) => void): this;

	// --- Extraction -------------------------------------------------------

	/**
	 * Returns the success value or throws the error.
	 * @throws the contained error `E` if `Err`.
	 */
	abstract unwrap(): T;

	/**
	 * Returns the error value or throws if `Ok`.
	 * @throws {Error} if `Ok`.
	 */
	abstract unwrapErr(): E;

	/** Success value or `fallback`. */
	abstract unwrapOr(fallback: T): T;

	/** Success value or the result of `fn` (receives the error). */
	abstract unwrapOrElse(fn: (error: E) => T): T;

	/** Branches depending on the variant. */
	abstract match<U>(cases: ResultMatch<T, E, U>): U;

	// --- Interop → Option -------------------------------------------------

	/** `Ok -> Some(value)`, `Err -> None` (discards the error). */
	abstract ok(): Option<T>;

	/** `Err -> Some(error)`, `Ok -> None`. */
	abstract err(): Option<E>;
}

/** Success variant of {@link Result}. */
class OkImpl<T, E> extends Result<T, E> {
	override readonly _tag = "Ok" as const;

	constructor(readonly value: T) {
		super();
	}

	override isOk(): this is Ok<T, E> {
		return true;
	}

	override isErr(): this is Err<T, E> {
		return false;
	}

	override map<U>(fn: (value: T) => U): Result<U, E> {
		return new OkImpl(fn(this.value));
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

	override unwrap(): T {
		return this.value;
	}

	override unwrapErr(): never {
		throw new Error("Result.unwrapErr() called on Ok");
	}

	override unwrapOr(_fallback: T): T {
		return this.value;
	}

	override unwrapOrElse(_fn: (error: E) => T): T {
		return this.value;
	}

	override match<U>(cases: ResultMatch<T, E, U>): U {
		return cases.ok(this.value);
	}

	override ok(): Option<T> {
		return Some(this.value);
	}

	override err(): Option<E> {
		return None();
	}
}

/** Failure variant of {@link Result}. */
class ErrImpl<T, E> extends Result<T, E> {
	override readonly _tag = "Err" as const;

	constructor(readonly error: E) {
		super();
	}

	override isOk(): this is Ok<T, E> {
		return false;
	}

	override isErr(): this is Err<T, E> {
		return true;
	}

	override map<U>(_fn: (value: T) => U): Result<U, E> {
		return this as unknown as Result<U, E>;
	}

	override mapErr<F>(fn: (error: E) => F): Result<T, F> {
		return new ErrImpl(fn(this.error));
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

	override unwrap(): never {
		throw this.error;
	}

	override unwrapErr(): E {
		return this.error;
	}

	override unwrapOr(fallback: T): T {
		return fallback;
	}

	override unwrapOrElse(fn: (error: E) => T): T {
		return fn(this.error);
	}

	override match<U>(cases: ResultMatch<T, E, U>): U {
		return cases.err(this.error);
	}

	override ok(): Option<T> {
		return None();
	}

	override err(): Option<E> {
		return Some(this.error);
	}
}

/** The `Ok` type: a successful {@link Result}. */
export type Ok<T, E = never> = OkImpl<T, E>;

/** The `Err` type: a failed {@link Result}. */
export type Err<T, E = never> = ErrImpl<T, E>;

/**
 * Creates an {@link Ok}.
 *
 * @example
 * ```ts
 * Ok(42) // Result<number, never>
 * ```
 */
export function Ok<T, E = never>(value: T): Result<T, E> {
	return new OkImpl(value);
}

/**
 * Creates an {@link Err}.
 *
 * @example
 * ```ts
 * Err(new Error('boom')) // Result<never, Error>
 * ```
 */
export function Err<T = never, E = never>(error: E): Result<T, E> {
	return new ErrImpl(error);
}
