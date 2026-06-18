// @ts-check

import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: "better-ts",
			description:
				"A better standard library for TypeScript. Zero dependency, ESM only.",
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/ixexel661/better-ts",
				},
			],
			sidebar: [
				{
					label: "Guides",
					items: [{ label: "Getting started", slug: "getting-started" }],
				},
				{
					label: "Types",
					items: [
						{ label: "Option", slug: "types/option" },
						{ label: "Result", slug: "types/result" },
						{ label: "Validated", slug: "types/validated" },
						{ label: "NonEmptyArray", slug: "types/non-empty-array" },
						{ label: "DeepReadonly", slug: "types/deep-readonly" },
						{ label: "Immutable", slug: "types/immutable" },
						{ label: "Lazy", slug: "types/lazy" },
						{ label: "Brand", slug: "types/brand" },
						{ label: "Iter", slug: "types/iter" },
					],
				},
			],
		}),
	],
});
