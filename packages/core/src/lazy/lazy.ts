/**
 * A deferred, memoized computation — like Scala's `lazy val`. The thunk runs at
 * most once, on the first {@link Lazy.get}; the result is cached and returned on
 * every subsequent call.
 *
 * @example
 * ```ts
 * const config = Lazy(() => expensiveParse())
 * config.get() // runs expensiveParse() once
 * config.get() // cached — no recomputation
 * config.map((c) => c.port) // still lazy
 * ```
 */
class LazyImpl<T> {
	private evaluated = false;
	private result!: T;
	// Cleared after evaluation so the captured closure scope can be GC'd.
	private thunk: (() => T) | undefined;

	constructor(thunk: () => T) {
		this.thunk = thunk;
	}

	/** Evaluates the thunk on first call, caches and returns the value. */
	get(): T {
		if (!this.evaluated) {
			// biome-ignore lint/style/noNonNullAssertion: thunk is set until evaluated
			this.result = this.thunk!();
			this.evaluated = true;
			this.thunk = undefined;
		}
		return this.result;
	}

	/** `true` once the value has been computed. */
	get isEvaluated(): boolean {
		return this.evaluated;
	}

	/** Maps the eventual value lazily — `fn` runs only when {@link get} is called. */
	map<U>(fn: (value: T) => U): Lazy<U> {
		return new LazyImpl(() => fn(this.get()));
	}

	/** Like {@link map}, but `fn` returns a `Lazy` itself; stays lazy. */
	flatMap<U>(fn: (value: T) => Lazy<U>): Lazy<U> {
		return new LazyImpl(() => fn(this.get()).get());
	}
}

/** A deferred, memoized computation. See {@link Lazy} constructor. */
export type Lazy<T> = LazyImpl<T>;

/**
 * Creates a {@link Lazy} from a thunk.
 *
 * @example
 * ```ts
 * const value = Lazy(() => compute()) // Lazy<number>
 * ```
 */
export function Lazy<T>(thunk: () => T): Lazy<T> {
	return new LazyImpl(thunk);
}

/**
 * Wraps an already-computed value in a {@link Lazy} (never recomputes).
 */
Lazy.of = <T>(value: T): Lazy<T> => {
	const wrapped = new LazyImpl(() => value);
	// Force evaluation so `isEvaluated` is immediately true.
	wrapped.get();
	return wrapped;
};
