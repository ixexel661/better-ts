import { tsdownBase } from "@better-ts/config/tsdown.base";
import { defineConfig } from "tsdown";

export default defineConfig({
	...tsdownBase,
	entry: ["src/index.ts"],
	// @better-ts/core stays a real runtime dependency (not bundled in).
});
