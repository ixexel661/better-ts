import { Iter, Lazy } from "@better-ts/core";

// A lazy pipeline over a huge range: only the needed values are produced.
const oddSquares = Iter.range(1, Number.MAX_SAFE_INTEGER)
	.map((n) => n * n)
	.filter((n) => n % 2 === 1)
	.take(5)
	.toArray();
console.log("first five odd squares:", oddSquares);

// find short-circuits at the first match.
const firstBigSquare = Iter.range(0, 1_000_000)
	.map((n) => n * n)
	.find((n) => n > 100)
	.getOrElse(() => -1);
console.log("first square over 100:", firstBigSquare);

// reduce works with a seed, or without one (then it returns an Option).
const sum = Iter([1, 2, 3, 4]).reduce((a, b) => a + b, 0);
console.log("sum:", sum);

const max = Iter([3, 1, 4, 1, 5, 9, 2])
	.reduce((a, b) => Math.max(a, b))
	.getOrElse(() => 0);
console.log("max:", max);

// Lazy: the thunk runs at most once, on the first get().
let evaluations = 0;
const settings = Lazy(() => {
	evaluations += 1;
	return { retries: 3 };
});
console.log("evaluated before get?", settings.isEvaluated);
console.log("retries:", settings.get().retries);
console.log("retries again:", settings.get().retries);
console.log("thunk evaluations:", evaluations);
