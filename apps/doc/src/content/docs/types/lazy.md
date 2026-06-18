---
title: Lazy
description: A value computed on first use and then cached.
---

`Lazy<T>` defers a computation until you ask for it, runs it once, and caches the
result. It is the equivalent of Scala's `lazy val`. Every call after the first
returns the stored value without running the work again.

```ts
import { Lazy } from "@better-ts/core";

const config = Lazy(() => expensiveParse());

config.get(); // runs expensiveParse() now
config.get(); // returns the cached result
```

`map` and `flatMap` stay lazy. They describe more work to do later without
forcing the value:

```ts
const port = config.map((c) => c.port); // nothing has run yet
port.get(); // now it runs
```

`isEvaluated` tells you whether the value has been computed, and `Lazy.of` wraps
a value you already have:

```ts
Lazy.of(42).isEvaluated; // true
```

## Reference

Constructors: `Lazy` and `Lazy.of`.

Members: `get` · `isEvaluated` · `map` · `flatMap`.
