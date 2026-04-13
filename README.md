# PollyPM Website

Marketing and documentation site for `pollypm.com`, covering the homepage, docs hub, and core PollyPM product documentation.

## Stack

- Astro for a static-first marketing and docs build
- Plain Astro components and CSS for a lightweight deployable site
- `@astrojs/check` and TypeScript for Astro diagnostics in the standard validation flow

## Local Development

```bash
nvm use
npm install
npm run dev
```

The repo uses Node `22.x` with a minimum supported version of `22.12.0`, declared in [`./.nvmrc`](./.nvmrc) and [`./.node-version`](./.node-version), and matched in CI.

## Production Build

```bash
npm run build
npm run preview
```

`npm run build` now includes built-site link verification and fails if any local `href` or `src` target in `dist/` does not resolve to a real file.

`npm run dev`, `npm run build`, `npm run check`, `npm run preview`, and `npm run astro ...` also enforce the supported Node runtime and will fail fast unless you are running Node `22.x` at or above `22.12.0`.

If you see `Node >=22.12.0 <23 is required for this repo`, switch to a compatible Node `22.x` runtime first, then rerun the command.

On macOS with Homebrew `node@22`, the repo provides wrapper scripts that run commands against the compatible runtime on either standard Homebrew prefix:

```bash
npm run check:node22
```

If you need the raw equivalent, it resolves through [`./scripts/run-with-homebrew-node22.mjs`](./scripts/run-with-homebrew-node22.mjs) to the Homebrew `node@22` binary.

Additional macOS/Homebrew-backed shortcuts are available for other guarded entrypoints:

```bash
npm run dev:node22
npm run build:node22
npm run preview:node22
npm run astro:node22 -- --version
```

## Validation

```bash
npm run check
```

`npm run check` is the standard validation command for this repo and currently runs the full production build, built-site link verification, and `astro check`.

`npm audit --omit=dev` and `npm audit` are both clean. The `@astrojs/check` chain is kept patched through a repo-local `overrides` entry for `yaml`.

If you want to run the built-link check by itself against an existing build:

```bash
npm run check:dist-links
```

GitHub Actions runs `npm run check` automatically on pull requests and on pushes to `main` via [`./.github/workflows/ci.yml`](./.github/workflows/ci.yml), and reads the baseline Node version from [`./.nvmrc`](./.nvmrc).

## Current Pages

- `/` marketing landing page
- `/docs` documentation landing page
- `/docs/getting-started` installation and first-run guide
- `/docs/concepts` concepts and architecture overview
- `/docs/cli-reference` CLI and configuration reference
- `/docs/faq` frequently asked questions
- `/404` error recovery page that routes users back into the site and docs
