---
title: Iter
description: A lazy iterator pipeline with no intermediate arrays.
---

`Iter<T>` wraps any iterable in a chain of transformations that runs lazily.
Nothing happens when you call `map` or `filter`. The work starts when a terminal
operation like `toArray` pulls values through, and it stops as soon as it has
what you asked for.

```ts
import { Iter } from "@better-ts/core";

Iter([1, 2, 3, 4, 5])
	.map((x) => x * 2)
	.filter((x) => x > 4)
	.take(2)
	.toArray(); // [6, 8], and only the elements it needed were touched
```

Because it is lazy, you can describe a pipeline over a range you would never want
to build in full:

```ts
Iter.range(0, 1_000_000)
	.map((x) => x * x)
	.find((x) => x > 100); // Option.value(121), then it stops
```

## Transformations

These build a new pipeline and run lazily: `map`, `filter`, `flatMap`, `take`,
`drop`, `entries`, `zip`, `concat`.

## Terminal operations

These pull values and produce a result: `toArray`, `toSet`, `reduce`, `forEach`,
`count`, `some`, `every`, `find`, `first`.

`reduce` works with or without a seed. With a seed it returns the accumulated
value. Without one it returns an [`Option`](/types/option/), empty when the
pipeline had no elements. `find` and `first` return an `Option` for the same
reason:

```ts
Iter([1, 2, 3, 4]).reduce((a, b) => a + b, 0); // 10
Iter<number>([]).reduce((a, b) => a + b); // Option.empty()
```

## Reference

Constructors: `Iter` and `Iter.range`.

Lazy: `map` · `filter` · `flatMap` · `take` · `drop` · `entries` · `zip` ·
`concat`.

Terminal: `toArray` · `toSet` · `reduce` · `forEach` · `count` · `some` ·
`every` · `find` · `first`.
