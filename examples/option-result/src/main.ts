import { Option, Result } from "@better-ts/core";

// --- Option: a typed replacement for `T | undefined` ---

interface User {
	id: string;
	name: string;
	email?: string;
}

const users: Record<string, User> = {
	u_1: { id: "u_1", name: "Ada", email: "ada@example.com" },
	u_2: { id: "u_2", name: "Linus" },
};

function findUser(id: string): Option<User> {
	// users[id] is `User | undefined` thanks to noUncheckedIndexedAccess.
	return Option.fromNullable(users[id]);
}

const adaEmail = findUser("u_1")
	.flatMap((user) => Option.fromNullable(user.email))
	.map((email) => email.toLowerCase())
	.getOrElse(() => "no email on file");
console.log("ada email:", adaEmail);

const missingName = findUser("u_404")
	.map((user) => user.name)
	.getOrElse(() => "unknown");
console.log("missing user:", missingName);

// --- Result: errors that show up in the type ---

function parseConfig(raw: string): Result<{ port: number }, string> {
	return Result.tryCatch(() => JSON.parse(raw) as { port: number }).mapErr(
		(error) => `invalid JSON: ${String(error)}`,
	);
}

parseConfig('{ "port": 3000 }').match({
	success: (config) => console.log("port:", config.port),
	error: (error) => console.error(error),
});

parseConfig("{ not json").match({
	success: (config) => console.log("port:", config.port),
	error: (error) => console.error("parse failed:", error),
});

// --- Interop: an Option becomes a Result and back ---

const nameLength = findUser("u_2")
	.toResult(() => "user not found")
	.map((user) => user.name.length)
	.getOrElse(() => 0);
console.log("name length:", nameLength);
