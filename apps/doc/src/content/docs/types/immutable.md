---
title: Immutable
description: A deep-readonly value with a type-level proof that it was actually frozen.
---

[`DeepReadonly<T>`](/types/deep-readonly/) is structural: any value with the
right readonly shape satisfies it, whether or not it was ever frozen.
`Immutable<T>` is stricter. It carries a brand that only `immutable()` can apply,
so the type is proof that the value really went through a runtime freeze.

```ts
import { type Immutable, immutable } from "@better-ts/core";

const config = immutable({ user: { name: "Ada" } });

function render(cfg: Immutable<{ user: { name: string } }>) {}

render(config); // ok, it was frozen
render({ user: { name: "Bob" } }); // type error, not branded
```

Use `deepFreeze` when you just want the readonly view. Use `immutable` when a
function should only accept a value that was genuinely frozen, and a
readonly-shaped literal should not be enough to pass.

## Reference

`Immutable<T>` (type) and `immutable` (constructor).
