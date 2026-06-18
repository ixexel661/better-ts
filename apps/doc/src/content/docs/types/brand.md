---
title: Brand
description: Nominal types that a plain string or number cannot impersonate.
---

A `Brand<T, B>` is a `T` tagged with a unique label `B`. A `Brand<string,
"UserId">` is still usable everywhere a `string` is, but a plain `string` is not
assignable back to it. That gap is the point. Once a value is branded, the only
way to get one is through your constructor, so an unchecked value cannot reach the
code that expects a checked one.

```ts
import { Brand } from "@better-ts/core";

type UserId = Brand<string, "UserId">;

const UserId = Brand.nominal<UserId>();
const id = UserId("u_1"); // UserId

takesUserId(id); // ok
takesUserId("u_1"); // type error, just a string
```

`Brand.nominal` is the identity at runtime. It only adds the tag in the type
system, so there is no wrapper object and no cost.

## Validating constructors

`Brand.refine` pairs the brand with a runtime check. It returns an
[`Option`](/types/option/), so a value gets branded only if it passes:

```ts
type Even = Brand<number, "Even">;

const Even = Brand.refine<Even>((n) => n % 2 === 0);

Even(4); // Option.value(4 as Even)
Even(3); // Option.empty()
```

## Reference

`Brand<T, B>` and `Unbrand<B>` (types), plus `Brand.nominal` and `Brand.refine`.
