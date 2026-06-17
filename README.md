# better-ts

Monorepo for **better-ts**, a better standard library for TypeScript.
Inspired by the Rust stdlib, Scala collections and the Kotlin stdlib. **Zero
dependency.**

## Packages

| Package | Description |
| --- | --- |
| [`@better-ts/core`](./packages/core) | `Option`, `Result`, `Validated`, `NonEmptyArray`, `DeepReadonly`, `Immutable`, `Lazy`, `Brand`, `Iter` |
| [`better-ts`](./packages/better-ts) | Meta package that re-exports `@better-ts/core` under the bare npm name |
| [`@better-ts/config`](./packages/config) | Shared TypeScript base config (`tsconfig.base.json`) |

## Why?

TypeScript ships with surprisingly few data types (`string`, `number`,
`boolean`, `Array`, `Map`, `Set`). A lot is missing:

- **`Option<T>`** instead of `User | undefined` → reduces null errors
- **`Result<T, E>`** instead of `throw` → explicit, type-safe error handling
- **`NonEmptyArray<T>`** → guarantees at least one element
- **`DeepReadonly<T>`** → recursive immutability instead of only the top level
- **`Immutable<T>`** → branded, runtime-proven deep immutable (only `immutable()` can produce one)
- **`Validated<E, A>`** → like `Result`, but accumulates **all** errors (form validation)
- **`Lazy<T>`** → deferred, memoized computation (Scala `lazy val`)
- **`Brand<T, B>`** → nominal newtypes with smart constructors (Rust newtype, Scala `opaque type`)
- **`Iter<T>`** → lazy iterator pipeline without intermediate arrays (Rust `Iterator`)

## Development

```bash
pnpm install        # install the workspace
pnpm typecheck      # type checking (tsc --noEmit)
pnpm test           # tests (vitest)
pnpm build          # build the bundle (tsdown -> ESM + .d.ts)
pnpm check          # lint & format (biome)
```

## Architecture

- pnpm workspace (`packages/*`)
- Built with [tsdown](https://tsdown.dev) → ESM + type declarations
- Tested with [Vitest](https://vitest.dev)
- Strict `tsconfig` defaults (`strict`, `exactOptionalPropertyTypes`,
  `noUncheckedIndexedAccess`)

## License

MIT
