---
title: Option
description: A typed alternative to T | undefined for values that might be missing.
---

`Option<T>` holds either a value or nothing. It is the typed version of
`T | undefined`, except the empty case does not slip through as a runtime null
error. You either have a value or you handle its absence, and the compiler holds
you to it.

## Creating an Option

```ts
import { Option } from "@better-ts/core";

Option.value(42); // holds 42
Option.empty<number>(); // holds nothing

// the common case: turn a nullable value into an Option
Option.fromNullable(localStorage.getItem("token")); // Option<string>
```

## Working with the value

`map`, `filter` and `flatMap` run only when a value is present. On an empty
Option they do nothing and pass the emptiness along.

```ts
const name = findUser(id) // Option<User>
	.map((user) => user.name)
	.filter((name) => name.length > 0)
	.getOrElse(() => "anonymous");
```

Use `flatMap` when the function itself returns an `Option`, so you do not end up
with an `Option<Option<T>>`:

```ts
Option.fromNullable(user).flatMap((user) => Option.fromNullable(user.email));
```

## Getting the value out

```ts
opt.getOrThrow(); // the value, or throws if empty
opt.getOrElse(() => fallback); // the value, or the fallback, computed lazily
opt.getOrNull(); // the value, or null
opt.getOrUndefined(); // the value, or undefined
```

Or handle both cases at once with `match`:

```ts
opt.match({
	value: (user) => render(user),
	empty: () => renderSignIn(),
});
```

To narrow the type instead, use the guards. After `hasValue()` the value is
reachable directly:

```ts
if (opt.hasValue()) {
	console.log(opt.value);
}
```

## Turning it into a Result

When an empty Option should become an error, hand `toResult` the error to use:

```ts
findUser(id).toResult(() => "user not found"); // Result<User, string>
```

## Reference

Constructors: `Option.value`, `Option.empty`, `Option.fromNullable`.

Methods: `hasValue` · `isEmpty` · `map` · `flatMap` · `filter` · `tap` ·
`getOrThrow` · `getOrElse` · `getOrNull` · `getOrUndefined` · `match` ·
`toResult`.
