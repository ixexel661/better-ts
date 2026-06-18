import { Brand, NonEmptyArray, Validated } from "@better-ts/core";

// Branded types: a raw string is not assignable where an Email is expected.
type Email = Brand<string, "Email">;
type Age = Brand<number, "Age">;

const parseEmail = Brand.refine<Email>((value) =>
	/^[^@\s]+@[^@\s]+$/.test(value),
);
const parseAge = Brand.refine<Age>(
	(value) => Number.isInteger(value) && value >= 0 && value <= 130,
);

interface Signup {
	email: Email;
	age: Age;
	tags: NonEmptyArray<string>;
}

function validateSignup(
	email: string,
	age: number,
	tags: string[],
): Validated<string, Signup> {
	const validEmail = Validated.fromOption(
		parseEmail(email),
		`invalid email: ${email}`,
	);
	const validAge = Validated.fromOption(parseAge(age), `invalid age: ${age}`);
	const validTags = Validated.fromOption(
		NonEmptyArray.fromArray(tags),
		"at least one tag is required",
	);

	// zip and zipWith run every validation and collect all the errors.
	return Validated.zipWith(
		validEmail.zip(validAge),
		validTags,
		([emailValue, ageValue], tagValues) => ({
			email: emailValue,
			age: ageValue,
			tags: tagValues,
		}),
	);
}

validateSignup("ada@example.com", 36, ["admin", "owner"]).match({
	valid: (signup) => console.log("valid signup:", signup),
	invalid: (errors) => console.error("rejected:", errors),
});

// Every field is wrong, so Validated reports all three errors at once.
validateSignup("nope", -3, []).match({
	valid: (signup) => console.log("valid signup:", signup),
	invalid: (errors) => console.error("rejected:", errors),
});
