# @better-ts/doc

The documentation site for better-ts, built with [Astro](https://astro.build)
and [Starlight](https://starlight.astro.build).

## Project structure

```
.
├── public/
├── src/
│   ├── assets/
│   ├── content/
│   │   └── docs/
│   └── content.config.ts
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

Starlight turns every `.md` or `.mdx` file under `src/content/docs/` into a route
named after the file. Images go in `src/assets/` and embed in Markdown with a
relative link; static files like favicons go in `public/`.

## Commands

Run these from this folder, or from the repo root with
`pnpm --filter @better-ts/doc <command>`.

| Command | Action |
| :-- | :-- |
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start the dev server at `localhost:4321` |
| `pnpm build` | Build the production site to `./dist/` |
| `pnpm preview` | Preview the build locally before deploying |
| `pnpm astro ...` | Run Astro CLI commands like `astro add` or `astro check` |

## Learn more

See the [Starlight docs](https://starlight.astro.build/), the
[Astro documentation](https://docs.astro.build), or the
[Astro Discord](https://astro.build/chat).
