import type { UserConfig } from "tsdown";

/**
 * Shared tsdown build options for libraries in the better-ts monorepo.
 *
 * Each package spreads this into its own `defineConfig` and only adds its
 * `entry`:
 *
 * ```ts
 * import { defineConfig } from "tsdown";
 * import { tsdownBase } from "@better-ts/config/tsdown.base";
 *
 * export default defineConfig({
 *   ...tsdownBase,
 *   entry: ["src/index.ts"],
 * });
 * ```
 */
export const tsdownBase = {
	format: ["esm"],
	dts: true,
	clean: true,
	treeshake: true,
	target: "es2022",
	platform: "neutral",
} satisfies UserConfig;
