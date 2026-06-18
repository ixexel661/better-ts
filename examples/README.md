# Examples

Runnable examples for `@better-ts/core`. Each folder is its own private
workspace package.

| Example | Shows |
| --- | --- |
| [option-result](./option-result) | `Option` for nullable values, `Result` for errors, and the interop between them |
| [validation](./validation) | `Validated` accumulating every error, with `Brand` and `NonEmptyArray` |
| [iter](./iter) | the lazy `Iter` pipeline and a memoized `Lazy` value |

## Running

From the repo root:

```bash
pnpm --filter @example/option-result start
pnpm --filter @example/validation start
pnpm --filter @example/iter start
```

Each example runs with `tsx` and imports `@better-ts/core` from the workspace.
`pnpm typecheck` also type-checks every example against the library source.
