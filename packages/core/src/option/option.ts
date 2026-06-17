import type { Result } from "../result/result.js";
import { Err, Ok } from "../result/result.js";

/**
 * Pattern for {@link Option.match}.
 */
export interface OptionMatch<T, U> {
	some: (value: T) => U;
	none: () => U;
}

/**
 * A container that either holds a value ({@link Some}) or is empty
 * ({@link None}). A type-safe alternative to `T | undefined` that reduces null
 * errors.
 *
 * @example
 * ```ts
 * const name = findUser(id)        // Option<User>
 *   .map((u) => u.name)
 *   .filter((n) => n.length > 0)
 *   .unwrapOr('anonymous')
 * ```
 */
export abstract class Option<T> {
	/** Discriminator used to tell the variants apart. */
	abstract readonly _tag: "Some" | "None";

	// --- Constructors / interop -------------------------------------------

	/** Creates a {@link Some} holding the given value. */
	static some<T>(value: T): Option<T> {
		return new SomeImpl(value);
	}

	/** Returns the shared {@link None}. */
	static none<T = never>(): Option<T> {
		return NONE as Option<T>;
	}

	/**
	 * Returns `None` for `null`/`undefined`, otherwise `Some(value)`.
	 *
	 * @example
	 * ```ts
	 * Option.fromNullable(process.env.HOME) // Option<string>
	 * ```
	 */
	static fromNullable<T>(value: T | null | undefined): Option<NonNullable<T>> {
		return value === null || value === undefined
			? (NONE as Option<NonNullable<T>>)
			: new SomeImpl(value as NonNullable<T>);
	}

	// --- Type guards ------------------------------------------------------

	/** `true` when a value is present (narrows to {@link Some}). */
	abstract isSome(): this is Some<T>;

	/** `true` when no value is present (narrows to {@link None}). */
	abstract isNone(): this is None;

	// --- Transformation ---------------------------------------------------

	/** Applies `fn` to the contained value; `None` stays `None`. */
	abstract map<U>(fn: (value: T) => U): Option<U>;

	/** Like {@link map}, but `fn` returns an `Option` itself. */
	abstract flatMap<U>(fn: (value: T) => Option<U>): Option<U>;

	/** Alias for {@link flatMap}. */
	andThen<U>(fn: (value: T) => Option<U>): Option<U> {
		return this.flatMap(fn);
	}

	/** Keeps the value only when `pred` returns `true`; otherwise `None`. */
	abstract filter(pred: (value: T) => boolean): Option<T>;

	/** Runs `fn` for the value (side effect) and returns `this`. */
	abstract tap(fn: (value: T) => void): this;

	// --- Extraction -------------------------------------------------------

	/**
	 * Returns the value or throws if `None`.
	 * @throws {Error} when the option is `None`.
	 */
	abstract unwrap(): T;

	/** Returns the value or `fallback`. */
	abstract unwrapOr(fallback: T): T;

	/** Returns the value or the result of `fn`. */
	abstract unwrapOrElse(fn: () => T): T;

	/** Value or `null`. */
	abstract toNullable(): T | null;

	/** Value or `undefined`. */
	abstract toUndefined(): T | undefined;

	/** Branches depending on the variant. */
	abstract match<U>(cases: OptionMatch<T, U>): U;

	// --- Interop → Result -------------------------------------------------

	/** Converts to `Result`: `Some -> Ok`, `None -> Err(error)`. */
	abstract okOr<E>(error: E): Result<T, E>;

	/** Like {@link okOr}, but the error is computed lazily. */
	abstract okOrElse<E>(fn: () => E): Result<T, E>;
}

/** Variant of {@link Option} that holds a value. */
class SomeImpl<T> extends Option<T> {
	override readonly _tag = "Some" as const;

	constructor(readonly value: T) {
		super();
	}

	override isSome(): this is Some<T> {
		return true;
	}

	override isNone(): this is None {
		return false;
	}

	override map<U>(fn: (value: T) => U): Option<U> {
		return new SomeImpl(fn(this.value));
	}

	override flatMap<U>(fn: (value: T) => Option<U>): Option<U> {
		return fn(this.value);
	}

	override filter(pred: (value: T) => boolean): Option<T> {
		return pred(this.value) ? this : (NONE as Option<T>);
	}

	override tap(fn: (value: T) => void): this {
		fn(this.value);
		return this;
	}

	override unwrap(): T {
		return this.value;
	}

	override unwrapOr(_fallback: T): T {
		return this.value;
	}

	override unwrapOrElse(_fn: () => T): T {
		return this.value;
	}

	override toNullable(): T | null {
		return this.value;
	}

	override toUndefined(): T | undefined {
		return this.value;
	}

	override match<U>(cases: OptionMatch<T, U>): U {
		return cases.some(this.value);
	}

	override okOr<E>(_error: E): Result<T, E> {
		return Ok(this.value);
	}

	override okOrElse<E>(_fn: () => E): Result<T, E> {
		return Ok(this.value);
	}
}

/** Variant of {@link Option} that holds no value. */
class NoneImpl extends Option<never> {
	override readonly _tag = "None" as const;

	override isSome(): this is Some<never> {
		return false;
	}

	override isNone(): this is None {
		return true;
	}

	override map<U>(_fn: (value: never) => U): Option<U> {
		return this as Option<U>;
	}

	override flatMap<U>(_fn: (value: never) => Option<U>): Option<U> {
		return this as Option<U>;
	}

	override filter(_pred: (value: never) => boolean): Option<never> {
		return this;
	}

	override tap(_fn: (value: never) => void): this {
		return this;
	}

	override unwrap(): never {
		throw new Error("Option.unwrap() called on None");
	}

	override unwrapOr<U>(fallback: U): U {
		return fallback;
	}

	override unwrapOrElse<U>(fn: () => U): U {
		return fn();
	}

	override toNullable(): null {
		return null;
	}

	override toUndefined(): undefined {
		return undefined;
	}

	override match<U>(cases: OptionMatch<never, U>): U {
		return cases.none();
	}

	override okOr<E>(error: E): Result<never, E> {
		return Err(error);
	}

	override okOrElse<E>(fn: () => E): Result<never, E> {
		return Err(fn());
	}
}

/** The `Some` type: an {@link Option} that is guaranteed to hold a value. */
export type Some<T> = SomeImpl<T>;

/** The `None` type: an empty {@link Option}. */
export type None = NoneImpl;

/** Shared singleton instance of `None`. */
const NONE: NoneImpl = new NoneImpl();

/**
 * Creates a {@link Some}.
 *
 * @example
 * ```ts
 * Some(42) // Option<number>
 * ```
 */
export function Some<T>(value: T): Option<T> {
	return new SomeImpl(value);
}

/**
 * Returns the shared {@link None}.
 *
 * @example
 * ```ts
 * None<number>() // Option<number>
 * ```
 */
export function None<T = never>(): Option<T> {
	return NONE as Option<T>;
}
