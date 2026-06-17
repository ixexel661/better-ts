# @better-ts/core

A better standard library for TypeScript, inspired by Rust, Scala and Kotlin.
**Zero dependency.** ESM only.

```bash
pnpm add @better-ts/core
```

## Option&lt;T&gt;

A type-safe alternative to `T | undefined`.

```ts
import { Option } from '@better-ts/core'

function findUser(id: string): Option<User> {
  const user = db.get(id)
  return Option.fromNullable(user)
}

const name = findUser('42')
  .map((u) => u.name)
  .filter((n) => n.length > 0)
  .getOrElse(() => 'anonymous')

findUser('42').match({
  value: (u) => console.log(u.name),
  empty: () => console.log('not found'),
})
```

Methods: `hasValue` · `isEmpty` · `map` · `flatMap` · `filter` · `tap` ·
`getOrThrow` · `getOrElse` · `getOrNull` · `getOrUndefined` · `match` · `toResult`.
Constructors: `Option.value`, `Option.empty`, `Option.fromNullable`.

## Result&lt;T, E&gt;

Makes errors visible in the type system instead of hiding them behind a `throw`.

```ts
import { Result } from '@better-ts/core'

const parsed = Result.tryCatch(() => JSON.parse(input))
  .map((data) => data.value)
  .mapErr((e) => new ParseError(e))
  .getOrElse(() => 0)

const res = await Result.fromPromise(fetch('/api'))
```

Methods: `isSuccess` · `isError` · `map` · `mapErr` · `flatMap` · `tap` · `tapErr` ·
`getOrThrow` · `getErrorOrThrow` · `getOrElse` · `getOrNull` · `getOrUndefined` ·
`match` · `toOption` · `getError`. Constructors: `Result.success`, `Result.error`,
`Result.tryCatch`, `Result.fromPromise`, `Result.fromNullable`.

## NonEmptyArray&lt;T&gt;

Guarantees at least one element at the type level.

```ts
import { NonEmptyArray } from '@better-ts/core'

const xs: NonEmptyArray<number> = [1, 2, 3]
const first = NonEmptyArray.first(xs) // number, never undefined

NonEmptyArray.fromArray(userInput).match({
  value: (ne) => process(ne),
  empty: () => console.log('empty'),
})
```

Helpers: `NonEmptyArray.isNonEmpty` (guard) · `fromArray` (→ `Option`) · `of` ·
`first` · `last` · `rest` · `map`.

## DeepReadonly&lt;T&gt;

Recursive immutability, where `Readonly<T>` only covers the top level.

```ts
import { type DeepReadonly, deepFreeze } from '@better-ts/core'

const config = deepFreeze({ user: { profile: { name: 'Ada' } } })
// config.user.profile.name = 'x' -> compile- and run-time error
```

`deepFreeze` also freezes `Map`/`Set` contents and is cycle-safe.

## Immutable&lt;T&gt;

A **branded** deep-immutable type. `DeepReadonly<T>` is purely structural: any
readonly-shaped object satisfies it. `Immutable<T>` also carries a type-level
proof that the value really went through a runtime freeze, and only `immutable()`
can produce one.

```ts
import { type Immutable, immutable } from '@better-ts/core'

const config = immutable({ user: { name: 'Ada' } }) // Immutable<{ user: ... }>

function render(cfg: Immutable<{ user: { name: string } }>) {}
render(config)                    // ok: proven frozen
render({ user: { name: 'Bob' } }) // type error: not branded
```

Use `deepFreeze` when you just want the readonly view; use `immutable` when a
signature should *require* a value that was genuinely frozen.

## Lazy&lt;T&gt;

A deferred, **memoized** computation (Scala's `lazy val`). The thunk runs at most
once; the result is cached. `map`/`flatMap` stay lazy.

```ts
import { Lazy } from '@better-ts/core'

const config = Lazy(() => expensiveParse())
config.get() // runs once
config.get() // cached
config.map((c) => c.port) // still lazy
```

## Brand&lt;T, B&gt;

Nominal ("newtype") types with a smart constructor (Rust newtype, Scala
`opaque type`). A `Brand<string, "UserId">` is usable as a `string`, but a raw
`string` is not assignable to it, so illegal values cannot be represented.

```ts
import { Brand } from '@better-ts/core'

type UserId = Brand<string, 'UserId'>
const UserId = Brand.nominal<UserId>()
const id = UserId('u_1') // UserId
fn(id)     // ok
fn('u_1')  // type error: not branded

// validating constructor → Option
type Even = Brand<number, 'Even'>
const Even = Brand.refine<Even>((n) => n % 2 === 0)
Even(4) // Option.value(4)
Even(3) // Option.empty()
```

## Validated&lt;E, A&gt;

Like `Result`, but **accumulates** errors instead of stopping at the first one
(Cats `Validated`). The error channel is a `NonEmptyArray`, so combining
validations collects every error at once. That makes it a good fit for form and
input validation.

```ts
import { Validated } from '@better-ts/core'

Validated.all([
  Validated.valid(name),
  Validated.invalid('email invalid'),
  Validated.invalid('age < 0'),
])
// invalid(['email invalid', 'age < 0']): all errors, not just the first

Validated.zipWith(validateName(n), validateAge(a), (name, age) => ({ name, age }))
```

Interop: `toResult()` → `Result<A, NonEmptyArray<E>>`, plus `Validated.fromResult`
and `Validated.fromOption`.

## Iter&lt;T&gt;

A **lazy**, chainable iterator pipeline over any iterable (Rust `Iterator`, Scala
`LazyList`). Transformations allocate no intermediate arrays; work happens only
when a terminal operation pulls values.

```ts
import { Iter } from '@better-ts/core'

Iter([1, 2, 3, 4, 5])
  .map((x) => x * 2)
  .filter((x) => x > 4)
  .take(2)
  .toArray() // [6, 8]; only the needed elements are processed

Iter.range(0, 1_000_000)
  .map((x) => x * x)
  .find((x) => x > 100) // Option.value(121); stops early
```

Terminals like `find`/`first`/`reduce` return an `Option`.

## License

MIT
