import { Result } from "../result/result.js";

/**
 * Handlers for {@link Option.match}.
 */
export interface OptionMatch<T, U> {
	value: (value: T) => U;
	empty: () => U;
}

/**
 * A container that either holds a value ({@link Value}) or is empty
 * ({@link Empty}). A type-safe alternative to `T | undefined` that keeps null
 * checks out of your business logic.
 *
 * @example
 * ```ts
 * const name = findUser(id)        // Option<User>
 *   .map((u) => u.name)
 *   .filter((n) => n.length > 0)
 *   .getOrElse(() => "anonymous")
 * ```
 */
export abstract class Option<T> {
	/** Discriminator that tells the two variants apart. */
	abstract readonly _tag: "Value" | "Empty";

	// --- Constructors / interop -------------------------------------------

	/** Wraps a present value. */
	static value<T>(value: T): Option<T> {
		return new ValueImpl(value);
	}

	/** Returns the shared empty option. */
	static empty<T = never>(): Option<T> {
		return EMPTY as Option<T>;
	}

	/**
	 * Returns an empty option for `null`/`undefined`, otherwise wraps the value.
	 *
	 * @example
	 * ```ts
	 * Option.fromNullable(process.env.HOME) // Option<string>
	 * ```
	 */
	static fromNullable<T>(value: T | null | undefined): Option<NonNullable<T>> {
		return value === null || value === undefined
			? (EMPTY as Option<NonNullable<T>>)
			: new ValueImpl(value as NonNullable<T>);
	}

	// --- Type guards ------------------------------------------------------

	/** `true` when a value is present (narrows to {@link Value}). */
	abstract hasValue(): this is Value<T>;

	/** `true` when the option is empty (narrows to {@link Empty}). */
	abstract isEmpty(): this is Empty;

	// --- Transformation ---------------------------------------------------

	/** Applies `fn` to the contained value; an empty option stays empty. */
	abstract map<U>(fn: (value: T) => U): Option<U>;

	/** Like {@link map}, but `fn` returns an `Option` itself. */
	abstract flatMap<U>(fn: (value: T) => Option<U>): Option<U>;

	/** Keeps the value only when `pred` returns `true`, otherwise empties it. */
	abstract filter(pred: (value: T) => boolean): Option<T>;

	/** Runs `fn` for the value (side effect) and returns `this`. */
	abstract tap(fn: (value: T) => void): this;

	// --- Extraction -------------------------------------------------------

	/**
	 * Returns the value, or throws when the option is empty.
	 * @throws {Error} when the option is empty.
	 */
	abstract getOrThrow(): T;

	/** Returns the value, or the result of `onEmpty` when empty. */
	abstract getOrElse(onEmpty: () => T): T;

	/** Returns the value, or `null` when empty. */
	abstract getOrNull(): T | null;

	/** Returns the value, or `undefined` when empty. */
	abstract getOrUndefined(): T | undefined;

	/** Branches on the variant. */
	abstract match<U>(cases: OptionMatch<T, U>): U;

	// --- Interop → Result -------------------------------------------------

	/** Turns the option into a `Result`, using `onEmpty` for the error case. */
	abstract toResult<E>(onEmpty: () => E): Result<T, E>;
}

/** The variant of {@link Option} that holds a value. */
class ValueImpl<T> extends Option<T> {
	override readonly _tag = "Value" as const;

	constructor(readonly value: T) {
		super();
	}

	override hasValue(): this is Value<T> {
		return true;
	}

	override isEmpty(): this is Empty {
		return false;
	}

	override map<U>(fn: (value: T) => U): Option<U> {
		return new ValueImpl(fn(this.value));
	}

	override flatMap<U>(fn: (value: T) => Option<U>): Option<U> {
		return fn(this.value);
	}

	override filter(pred: (value: T) => boolean): Option<T> {
		return pred(this.value) ? this : (EMPTY as Option<T>);
	}

	override tap(fn: (value: T) => void): this {
		fn(this.value);
		return this;
	}

	override getOrThrow(): T {
		return this.value;
	}

	override getOrElse(_onEmpty: () => T): T {
		return this.value;
	}

	override getOrNull(): T | null {
		return this.value;
	}

	override getOrUndefined(): T | undefined {
		return this.value;
	}

	override match<U>(cases: OptionMatch<T, U>): U {
		return cases.value(this.value);
	}

	override toResult<E>(_onEmpty: () => E): Result<T, E> {
		return Result.success(this.value);
	}
}

/** The empty variant of {@link Option}. */
class EmptyImpl extends Option<never> {
	override readonly _tag = "Empty" as const;

	override hasValue(): this is Value<never> {
		return false;
	}

	override isEmpty(): this is Empty {
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

	override getOrThrow(): never {
		throw new Error("Option.getOrThrow() called on an empty Option");
	}

	override getOrElse<U>(onEmpty: () => U): U {
		return onEmpty();
	}

	override getOrNull(): null {
		return null;
	}

	override getOrUndefined(): undefined {
		return undefined;
	}

	override match<U>(cases: OptionMatch<never, U>): U {
		return cases.empty();
	}

	override toResult<E>(onEmpty: () => E): Result<never, E> {
		return Result.error(onEmpty());
	}
}

/** The `Value` type: an {@link Option} that is guaranteed to hold a value. */
export type Value<T> = ValueImpl<T>;

/** The `Empty` type: an {@link Option} that holds no value. */
export type Empty = EmptyImpl;

/** Shared singleton instance of the empty option. */
const EMPTY: EmptyImpl = new EmptyImpl();
