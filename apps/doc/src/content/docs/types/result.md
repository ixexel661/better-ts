---
title: Result
description: Make failure part of the return type instead of throwing.
---

`Result<T, E>` is either a success carrying a value or a failure carrying an
error. Instead of throwing and trusting the caller to wrap things in a
`try`/`catch`, you put the error in the return type, where it shows up at every
call site.

## Creating a Result

```ts
import { Result } from "@better-ts/core";

Result.success(42);
Result.error("boom");

// run something that might throw and capture it
Result.tryCatch(() => JSON.parse(input)); // Result<unknown, unknown>

// await a promise: fulfilled becomes success, rejected becomes failure
await Result.fromPromise(fetch("/api")); // Promise<Result<Response, unknown>>
```

## Transforming

`map` changes the success value, `mapErr` changes the error, and `flatMap` chains
another step that itself returns a `Result`. A failure flows straight through
`map` untouched.

```ts
const parsed = Result.tryCatch(() => JSON.parse(input))
	.map((data) => data.value)
	.mapErr((error) => new ParseError(error));
```

## Getting the value out

```ts
result.getOrThrow(); // the value, or throws the error
result.getOrElse((error) => 0); // the value, or a fallback built from the error
result.getOrNull(); // the value, or null
```

```ts
result.match({
	success: (value) => use(value),
	error: (error) => report(error),
});
```

## Moving between Result and Option

A `Result` can drop its error to become an `Option`, and it can also hand you the
error as an `Option`:

```ts
result.toOption(); // Option<T>, empty on failure
result.getError(); // Option<E>, empty on success
```

## Reference

Constructors: `Result.success`, `Result.error`, `Result.tryCatch`,
`Result.fromPromise`, `Result.fromNullable`.

Methods: `isSuccess` · `isError` · `map` · `mapErr` · `flatMap` · `tap` ·
`tapErr` · `getOrThrow` · `getErrorOrThrow` · `getOrElse` · `getOrNull` ·
`getOrUndefined` · `match` · `toOption` · `getError`.
