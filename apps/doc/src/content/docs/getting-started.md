---
title: Getting started
description: Install better-ts and take a quick tour of what it adds to TypeScript.
---

better-ts is a small standard library for TypeScript. It adds the data types the
language leaves out, with no runtime dependencies and ESM-only output.

## Install

Pick the package you want:

```bash
# everything, under one import
pnpm add @better-ts/core

# or the meta package: the same exports under the bare name
pnpm add better-ts
```

Both expose the same API. The rest of these docs import from `@better-ts/core`.

## A quick tour

Most of the library is about making the awkward cases visible in the type system
instead of leaving them for runtime.

```ts
import { Option, Result } from "@better-ts/core";

// `undefined` becomes a type you have to handle.
const port = Option.fromNullable(process.env.PORT)
	.map((value) => Number.parseInt(value, 10))
	.filter((value) => Number.isFinite(value))
	.getOrElse(() => 3000);

// errors live in the return type, not in a thrown exception.
const config = Result.tryCatch(() => JSON.parse(input)).mapErr(
	(error) => `bad config: ${String(error)}`,
);
```

## What's in the box

- [Option](/types/option/) for values that might be missing.
- [Result](/types/result/) for operations that might fail.
- [Validated](/types/validated/) for collecting every validation error at once.
- [NonEmptyArray](/types/non-empty-array/) for arrays that always have a first element.
- [DeepReadonly](/types/deep-readonly/) and [Immutable](/types/immutable/) for immutability that goes all the way down.
- [Lazy](/types/lazy/) for a value you compute at most once.
- [Brand](/types/brand/) for nominal types a plain `string` cannot impersonate.
- [Iter](/types/iter/) for lazy iteration without intermediate arrays.

The types are built to work together. An `Option` becomes a `Result`, a `Result`
becomes a `Validated`, and `Iter` hands you an `Option` when a lookup might come
up empty.
