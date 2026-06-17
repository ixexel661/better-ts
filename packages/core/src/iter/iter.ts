import type { Option } from "../option/option.js";
import { None, Some } from "../option/option.js";

/**
 * A lazy, chainable iterator pipeline over any `Iterable<T>` — like Rust's
 * `Iterator` or Scala's `LazyList`. Transformations build a new pipeline without
 * allocating intermediate arrays; work happens only when a terminal operation
 * (e.g. {@link IterImpl.toArray}) pulls values.
 *
 * Re-iterable: as long as the underlying source is re-iterable (arrays are), an
 * `Iter` can be consumed more than once.
 *
 * @example
 * ```ts
 * Iter([1, 2, 3, 4, 5])
 *   .map((x) => x * 2)
 *   .filter((x) => x > 4)
 *   .take(2)
 *   .toArray() // [6, 8] — only as many elements as needed are processed
 * ```
 */
class IterImpl<T> implements Iterable<T> {
	constructor(private readonly source: Iterable<T>) {}

	[Symbol.iterator](): Iterator<T> {
		return this.source[Symbol.iterator]();
	}

	// --- Lazy transformations ---------------------------------------------

	/** Maps every element lazily. */
	map<U>(fn: (value: T, index: number) => U): Iter<U> {
		const source = this.source;
		return lazy(function* () {
			let index = 0;
			for (const value of source) {
				yield fn(value, index++);
			}
		});
	}

	/** Keeps only elements for which `pred` returns `true`. */
	filter(pred: (value: T, index: number) => boolean): Iter<T> {
		const source = this.source;
		return lazy(function* () {
			let index = 0;
			for (const value of source) {
				if (pred(value, index++)) {
					yield value;
				}
			}
		});
	}

	/** Maps each element to an iterable and flattens the results. */
	flatMap<U>(fn: (value: T, index: number) => Iterable<U>): Iter<U> {
		const source = this.source;
		return lazy(function* () {
			let index = 0;
			for (const value of source) {
				yield* fn(value, index++);
			}
		});
	}

	/** Yields at most the first `n` elements. */
	take(n: number): Iter<T> {
		const source = this.source;
		return lazy(function* () {
			if (n <= 0) {
				return;
			}
			let count = 0;
			for (const value of source) {
				yield value;
				if (++count >= n) {
					return;
				}
			}
		});
	}

	/** Skips the first `n` elements. */
	drop(n: number): Iter<T> {
		const source = this.source;
		return lazy(function* () {
			let count = 0;
			for (const value of source) {
				if (count++ < n) {
					continue;
				}
				yield value;
			}
		});
	}

	/** Pairs each element with its index. */
	enumerate(): Iter<[number, T]> {
		const source = this.source;
		return lazy(function* () {
			let index = 0;
			for (const value of source) {
				yield [index++, value] as [number, T];
			}
		});
	}

	/** Pairs elements with `other`, stopping at the shorter side. */
	zip<U>(other: Iterable<U>): Iter<[T, U]> {
		const source = this.source;
		return lazy(function* () {
			const left = source[Symbol.iterator]();
			const right = other[Symbol.iterator]();
			while (true) {
				const a = left.next();
				const b = right.next();
				if (a.done || b.done) {
					return;
				}
				yield [a.value, b.value] as [T, U];
			}
		});
	}

	/** Concatenates `other` after this pipeline. */
	concat(other: Iterable<T>): Iter<T> {
		const source = this.source;
		return lazy(function* () {
			yield* source;
			yield* other;
		});
	}

	// --- Terminal operations ----------------------------------------------

	/** Materializes the pipeline into an array. */
	toArray(): T[] {
		return [...this];
	}

	/** Materializes the pipeline into a `Set`. */
	toSet(): Set<T> {
		return new Set(this);
	}

	/** Left fold over all elements. */
	fold<B>(initial: B, fn: (acc: B, value: T) => B): B {
		let acc = initial;
		for (const value of this) {
			acc = fn(acc, value);
		}
		return acc;
	}

	/** Reduces without a seed; `None` for an empty pipeline. */
	reduce(fn: (acc: T, value: T) => T): Option<T> {
		const iterator = this[Symbol.iterator]();
		const first = iterator.next();
		if (first.done) {
			return None();
		}
		let acc = first.value;
		for (let next = iterator.next(); !next.done; next = iterator.next()) {
			acc = fn(acc, next.value);
		}
		return Some(acc);
	}

	/** Runs `fn` for every element (side effect). */
	forEach(fn: (value: T, index: number) => void): void {
		let index = 0;
		for (const value of this) {
			fn(value, index++);
		}
	}

	/** Counts the elements (consumes the pipeline). */
	count(): number {
		let count = 0;
		for (const _ of this) {
			count++;
		}
		return count;
	}

	/** `true` if any element matches `pred` (short-circuits). */
	some(pred: (value: T) => boolean): boolean {
		for (const value of this) {
			if (pred(value)) {
				return true;
			}
		}
		return false;
	}

	/** `true` if every element matches `pred` (short-circuits). */
	every(pred: (value: T) => boolean): boolean {
		for (const value of this) {
			if (!pred(value)) {
				return false;
			}
		}
		return true;
	}

	/** First element matching `pred`, as an {@link Option}. */
	find(pred: (value: T, index: number) => boolean): Option<T> {
		let index = 0;
		for (const value of this) {
			if (pred(value, index++)) {
				return Some(value);
			}
		}
		return None();
	}

	/** The first element, as an {@link Option}. */
	first(): Option<T> {
		for (const value of this) {
			return Some(value);
		}
		return None();
	}
}

/** A lazy iterator pipeline. See the {@link Iter} constructor. */
export type Iter<T> = IterImpl<T>;

/** Builds a re-iterable `Iter` from a generator function. */
function lazy<U>(generator: () => Generator<U>): Iter<U> {
	return new IterImpl<U>({ [Symbol.iterator]: generator });
}

/**
 * Wraps any iterable in a lazy {@link Iter} pipeline.
 *
 * @example
 * ```ts
 * Iter([1, 2, 3]).map((x) => x + 1).toArray() // [2, 3, 4]
 * ```
 */
export function Iter<T>(source: Iterable<T>): Iter<T> {
	return new IterImpl(source);
}

/**
 * A lazy numeric range `[start, end)` with an optional `step` (defaults to `1`,
 * may be negative for descending ranges).
 *
 * @example
 * ```ts
 * range(0, 5).toArray()       // [0, 1, 2, 3, 4]
 * range(10, 0, -2).toArray()  // [10, 8, 6, 4, 2]
 * ```
 */
export function range(start: number, end: number, step = 1): Iter<number> {
	return lazy(function* () {
		if (step === 0) {
			throw new Error("range() step must not be zero");
		}
		if (step > 0) {
			for (let i = start; i < end; i += step) {
				yield i;
			}
		} else {
			for (let i = start; i > end; i += step) {
				yield i;
			}
		}
	});
}
