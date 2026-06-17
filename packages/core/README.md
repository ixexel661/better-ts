# @better-ts/core

A better standard library for TypeScript — inspired by Rust, Scala and Kotlin.
**Zero dependency.** ESM only.

```bash
pnpm add @better-ts/core
```

## Option&lt;T&gt;

A type-safe alternative to `T | undefined`.

```ts
import { Option, Some, None } from '@better-ts/core'

function findUser(id: string): Option<User> {
  const user = db.get(id)
  return Option.fromNullable(user)
}

const name = findUser('42')
  .map((u) => u.name)
  .filter((n) => n.length > 0)
  .unwrapOr('anonymous')

findUser('42').match({
  some: (u) => console.log(u.name),
  none: () => console.log('not found'),
})
```

Methods: `isSome` · `isNone` · `map` · `flatMap`/`andThen` · `filter` · `tap` ·
`unwrap` · `unwrapOr` · `unwrapOrElse` · `toNullable` · `toUndefined` · `match` ·
`okOr` · `okOrElse`. Constructors: `Some`, `None`, `Option.fromNullable`.

## Result&lt;T, E&gt;

Makes errors visible in the type system — instead of `throw`.

```ts
import { Result, Ok, Err } from '@better-ts/core'

const parsed = Result.tryCatch(() => JSON.parse(input))
  .map((data) => data.value)
  .mapErr((e) => new ParseError(e))
  .unwrapOr(0)

const res = await Result.fromPromise(fetch('/api'))
```

Methods: `isOk` · `isErr` · `map` · `mapErr` · `flatMap`/`andThen` · `tap` ·
`tapErr` · `unwrap` · `unwrapErr` · `unwrapOr` · `unwrapOrElse` · `match` · `ok` ·
`err`. Constructors: `Ok`, `Err`, `Result.tryCatch`, `Result.fromPromise`,
`Result.fromNullable`.

## NonEmptyArray&lt;T&gt;

Guarantees at least one element at the type level.

```ts
import { type NonEmptyArray, nonEmpty, head, mapNonEmpty } from '@better-ts/core'

const xs: NonEmptyArray<number> = [1, 2, 3]
const first = head(xs) // number — no `| undefined`

nonEmpty(userInput).match({
  some: (ne) => process(ne),
  none: () => console.log('empty'),
})
```

Helpers: `isNonEmpty` (guard) · `nonEmpty` (→ `Option`) · `of` · `head` · `last` ·
`tail` · `mapNonEmpty`.

## DeepReadonly&lt;T&gt;

Recursive immutability — unlike `Readonly<T>` (top level only).

```ts
import { type DeepReadonly, deepFreeze } from '@better-ts/core'

const config = deepFreeze({ user: { profile: { name: 'Ada' } } })
// config.user.profile.name = 'x' -> compile- and run-time error
```

`deepFreeze` also freezes `Map`/`Set` contents and is cycle-safe.

## Immutable&lt;T&gt;

A **branded** deep-immutable type. `DeepReadonly<T>` is purely structural — any
readonly-shaped object satisfies it. `Immutable<T>` additionally carries a
type-level proof that the value actually went through a runtime freeze, and can
only be produced by `immutable()`.

```ts
import { type Immutable, immutable } from '@better-ts/core'

const config = immutable({ user: { name: 'Ada' } }) // Immutable<{ user: ... }>

function render(cfg: Immutable<{ user: { name: string } }>) {}
render(config)                    // ok — proven frozen
render({ user: { name: 'Bob' } }) // type error — not branded
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
`string` is not assignable to it — illegal values become unrepresentable.

```ts
import { type Brand, brand, refine } from '@better-ts/core'

type UserId = Brand<string, 'UserId'>
const UserId = brand<UserId>()
const id = UserId('u_1') // UserId
fn(id)     // ok
fn('u_1')  // type error — not branded

// validating constructor → Option
type Even = Brand<number, 'Even'>
const Even = refine<Even>((n) => n % 2 === 0)
Even(4) // Some(4)
Even(3) // None
```

## Validated&lt;E, A&gt;

Like `Result`, but **accumulates** errors instead of stopping at the first one
(Cats `Validated`). The error channel is a `NonEmptyArray`, so combining
validations collects every error — ideal for form/input validation.

```ts
import { Valid, Invalid, Validated } from '@better-ts/core'

Validated.all([
  Valid(name),
  Invalid('email invalid'),
  Invalid('age < 0'),
])
// Invalid(['email invalid', 'age < 0']) — all errors, not just the first

Validated.map2(validateName(n), validateAge(a), (name, age) => ({ name, age }))
```

Interop: `toResult()` → `Result<A, NonEmptyArray<E>>`, plus `Validated.fromResult`
and `Validated.fromOption`.

## Iter&lt;T&gt;

A **lazy**, chainable iterator pipeline over any iterable (Rust `Iterator`, Scala
`LazyList`). Transformations allocate no intermediate arrays; work happens only
when a terminal operation pulls values.

```ts
import { Iter, range } from '@better-ts/core'

Iter([1, 2, 3, 4, 5])
  .map((x) => x * 2)
  .filter((x) => x > 4)
  .take(2)
  .toArray() // [6, 8] — only the needed elements are processed

range(0, 1_000_000)
  .map((x) => x * x)
  .find((x) => x > 100) // Some(121) — stops early
```

Terminals like `find`/`first`/`reduce` return an `Option`.

## License

MIT
