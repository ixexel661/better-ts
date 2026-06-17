/**
 * Makes a type recursively readonly — unlike `Readonly<T>`, which only affects
 * the top level. Arrays, `Map` and `Set` become their `Readonly` variants;
 * functions and primitives are left unchanged.
 *
 * @example
 * ```ts
 * type Config = DeepReadonly<{ user: { profile: { name: string } } }>
 * // every level is readonly
 * ```
 */
export type DeepReadonly<T> =
	T extends ReadonlyArray<infer R>
		? ReadonlyArray<DeepReadonly<R>>
		: T extends (...args: never[]) => unknown
			? T
			: T extends Map<infer K, infer V>
				? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
				: T extends Set<infer U>
					? ReadonlySet<DeepReadonly<U>>
					: T extends object
						? { readonly [P in keyof T]: DeepReadonly<T[P]> }
						: T;

function isFreezable(value: unknown): value is object {
	return (
		value !== null && (typeof value === "object" || typeof value === "function")
	);
}

/**
 * Recursively freezes a value and returns it as {@link DeepReadonly}. Freezes
 * nested objects, arrays as well as Map/Set contents. Idempotent and cycle-safe.
 *
 * @remarks
 * Mutates the passed object (like `Object.freeze`). After `Object.freeze` the
 * `Map`/`Set` itself can no longer accept new entries.
 *
 * @example
 * ```ts
 * const cfg = deepFreeze({ user: { name: 'Ada' } })
 * // cfg.user.name = 'x' -> error in strict mode
 * ```
 */
export function deepFreeze<T>(value: T): DeepReadonly<T> {
	return freezeRec(value, new WeakSet<object>()) as DeepReadonly<T>;
}

function freezeRec<T>(value: T, seen: WeakSet<object>): T {
	if (!isFreezable(value) || seen.has(value)) {
		return value;
	}
	seen.add(value);

	for (const child of nestedValues(value)) {
		freezeRec(child, seen);
	}

	return Object.freeze(value);
}

/**
 * The single source of truth for which nested values a container holds.
 * Adding support for another container kind only requires a branch here — the
 * traversal in {@link freezeRec} stays agnostic.
 */
function* nestedValues(value: object): Iterable<unknown> {
	if (value instanceof Map) {
		for (const [key, val] of value) {
			yield key;
			yield val;
		}
	} else if (value instanceof Set) {
		yield* value;
	} else {
		for (const key of Reflect.ownKeys(value)) {
			yield (value as Record<PropertyKey, unknown>)[key];
		}
	}
}
