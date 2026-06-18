---
title: NonEmptyArray
description: An array the compiler knows has at least one element.
---

`NonEmptyArray<T>` is an array with at least one element, guaranteed at the type
level as `[T, ...T[]]`. Because the first element always exists, `first` returns a
`T` instead of `T | undefined`, and operations that need a starting value have
one.

The helpers live on a `NonEmptyArray` namespace object.

## Building one

```ts
import { NonEmptyArray } from "@better-ts/core";

NonEmptyArray.of(1, 2, 3); // NonEmptyArray<number>

// from a plain array, when you cannot be sure it has anything
NonEmptyArray.fromArray(input).match({
	value: (ne) => process(ne),
	empty: () => console.log("nothing to do"),
});
```

`fromArray` returns an [`Option`](/types/option/), since an empty input has no
non-empty version. To narrow an array you already hold, use the guard:

```ts
if (NonEmptyArray.isNonEmpty(xs)) {
	NonEmptyArray.first(xs); // allowed: xs is a NonEmptyArray<T> here
}
```

## Reading elements

```ts
NonEmptyArray.first(xs); // T, never undefined
NonEmptyArray.last(xs); // T, never undefined
NonEmptyArray.rest(xs); // T[], everything after the first
```

## Mapping

`map` keeps the guarantee, so the result is still a `NonEmptyArray`:

```ts
NonEmptyArray.map(xs, (x) => x * 2); // NonEmptyArray<number>
```

## Reference

`NonEmptyArray.of` · `fromArray` · `isNonEmpty` · `first` · `last` · `rest` ·
`map`.
