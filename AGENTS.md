# Agent instructions

This is the **better-ts** repository, a zero-dependency standard library for
TypeScript (`Option`, `Result`, `Validated`, `NonEmptyArray`, `DeepReadonly`,
`Immutable`, `Lazy`, `Brand`, `Iter`). It takes after the Rust, Scala and Kotlin
standard libraries. ESM only.

## Development workflow

- The git base branch is `master`.
- Use `pnpm` as the package manager. It is pinned via `devEngines`, so `npm` and
  `npx` fail with `EBADDEVENGINES`; reach for `pnpm` or `pnpm dlx` instead.
- It is a pnpm workspace monorepo. The packages live under `packages/*`:
  - `@better-ts/core` holds all the types.
  - `better-ts` is a meta package that re-exports core under the bare npm name.
  - `@better-ts/config` holds the shared `tsconfig.base.json`.

### Core principles

- Zero dependencies. `@better-ts/core` ships no runtime dependencies, so do not
  add any.
- Every automated check has to pass.
- Prefer the clear, maintainable solution over the clever one.
- Skip comments unless they explain something non-obvious. JSDoc on the public
  API is expected.

### Mandatory validation steps

Run these from the repo root after making changes:

- `pnpm check:fix` formats and lints with Biome (auto-fix).
- `pnpm typecheck` type-checks every package (`tsc --noEmit`).
- `pnpm test` runs the tests (Vitest).
- `pnpm build` builds the bundles (tsdown, ESM plus `.d.ts`).

To work on a single package, use `pnpm --filter @better-ts/core <script>`.

## Code style

**Always** read the existing code and follow its patterns before writing new
code.

Do not fuss over formatting while writing. Run `pnpm check:fix` to apply the
project style. Biome is set up for tabs, double quotes, and imports and exports
sorted alphabetically.

### Type module pattern

Each type lives in its own folder, `packages/core/src/<name>/<name>.ts`, next to
a co-located `<name>.test.ts` (see [option/](packages/core/src/option/) and
[iter/](packages/core/src/iter/)).

A type with variants follows the shape in
[option.ts](packages/core/src/option/option.ts): internal `…Impl` classes
(`ValueImpl`, `EmptyImpl`), an abstract base class that also carries the
constructors as statics (`Option.value`, `Option.empty`), and exported narrowing
`type` aliases (`Value<T>`, `Empty`). A helper-only module exposes a single
namespace object instead, the way `NonEmptyArray` and `Brand` do.

### Barrel file

[packages/core/src/index.ts](packages/core/src/index.ts) is the hand-written
barrel. When you add or remove a module, edit it by hand: add a section comment
(`// <Name>`) and re-export. Biome sorts the entries, so run `pnpm check:fix` to
settle the order.

`knip` reports unused files. If it flags a config file, add it as an entry in
[knip.json](knip.json) rather than turning the check off.

## Testing

Read the existing tests for similar functionality before writing new ones, and
follow their patterns.

- Tests sit next to the source as `<name>/<name>.test.ts`.
- Vitest runs with globals enabled (`vitest/globals`), but the existing tests
  still import `describe`, `it`, `expect` and `vi` from `vitest`. Do the same.
- Type-level negative cases use `// @ts-expect-error`.
- Run one file with `pnpm --filter @better-ts/core test <name>`.

## Releasing

`bumpp` handles versioning (`pnpm release`). There is no changeset workflow in
this repo.
