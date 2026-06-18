---
title: DeepReadonly
description: Recursive readonly, not just the top level.
---

`Readonly<T>` only freezes the outermost layer. Nested objects, arrays, and the
contents of a `Map` or `Set` stay mutable. `DeepReadonly<T>` goes all the way
down.

```ts
import { type DeepReadonly, deepFreeze } from "@better-ts/core";

type Config = DeepReadonly<{ user: { profile: { name: string } } }>;
// every level is readonly
```

## Freezing at runtime

`deepFreeze` applies `Object.freeze` recursively and returns the value typed as
`DeepReadonly<T>`. It walks plain objects and arrays, and the keys and values
inside a `Map` or `Set`.

```ts
const config = deepFreeze({ user: { profile: { name: "Ada" } } });
config.user.profile.name = "x"; // compile error, and throws in strict mode
```

:::caution
`deepFreeze` mutates the object you pass in, the same way `Object.freeze` does.
Once frozen, a `Map` or `Set` can no longer take new entries. The walk is
cycle-safe, so a value that references itself will not loop forever.
:::

## Reference

`DeepReadonly<T>` (type) and `deepFreeze` (runtime).
