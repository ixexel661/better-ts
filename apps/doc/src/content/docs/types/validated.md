---
title: Validated
description: Like Result, but it collects every error instead of stopping at the first.
---

`Validated<E, A>` looks like `Result`, with one difference that matters for
validation: when you combine several of them, it keeps every error instead of
short-circuiting on the first failure. The error side is a
[`NonEmptyArray`](/types/non-empty-array/), so an invalid result always carries
at least one error.

This is what you want for a form. A user who got three fields wrong should hear
about all three at once, not one reload at a time.

## Creating a Validated

```ts
import { Validated } from "@better-ts/core";

Validated.valid(42);
Validated.invalid("name is required");
```

## Combining validations

`all` runs a list of validations of the same type and gathers the failures:

```ts
Validated.all([validateTag(a), validateTag(b)]); // Validated<string, Tag[]>
```

To combine values of different types, use `zip` for two or `zipWith` to merge
them as you go:

```ts
validateName(name).zip(validateAge(age)); // Validated<string, [Name, Age]>

Validated.zipWith(
	validateName(name),
	validateAge(age),
	(name, age) => ({ name, age }),
);
```

Either way, both sides run and their errors are concatenated.

## Reading the result

```ts
v.getOrElse((errors) => fallback);

v.match({
	valid: (value) => save(value),
	invalid: (errors) => show(errors), // errors is a NonEmptyArray
});
```

## Interop with Result and Option

```ts
Validated.fromResult(result); // a Result becomes a Validated
Validated.fromOption(option, "missing"); // an empty Option becomes that error
v.toResult(); // Result<A, NonEmptyArray<E>>
```

## Reference

Constructors: `Validated.valid`, `Validated.invalid`, `Validated.fromResult`,
`Validated.fromOption`.

Combinators: `Validated.all`, `Validated.zipWith`, `zip`.

Methods: `isValid` · `isInvalid` · `map` · `mapErrors` · `zip` · `getOrThrow` ·
`getOrElse` · `match` · `toResult`.
