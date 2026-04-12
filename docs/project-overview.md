# Project Overview

## Goals
- Keep the PollyPM marketing site and documentation hub consistent, shippable, and easy to navigate.

## Current State
- The site includes the homepage, docs hub, getting started guide, concepts page, CLI reference, FAQ, and a 404 page.
- Documentation navigation and footer links are consistent across the docs pages.
- SEO support includes canonical URLs, sitemap entries for the docs pages, manifest metadata, and `noindex` on the 404 page.
- Validation is standardized through `npm run check`, which runs the production build, built-link verification, and `astro check`.
- Astro diagnostics in that validation flow are supported by the repo-local `@astrojs/check` and TypeScript dependencies.
- `npm audit --omit=dev` and `npm audit` are clean; the `@astrojs/check` chain is kept patched through a repo-local `overrides` entry for `yaml`.
- GitHub Actions runs the validation workflow on pull requests and on pushes to `main`, using the baseline Node version from `.nvmrc`.
- Local development targets Node `22.x` with a minimum supported version of `22.12.0`, declared via `.nvmrc` and `.node-version` to stay aligned with CI.
- `npm run dev`, `npm run build`, `npm run check`, `npm run preview`, and `npm run astro ...` now fail fast if the shell is not running a compatible Node `22.x` release.
- On macOS with Homebrew `node@22`, the repo provides wrapper scripts that route commands through `scripts/run-with-homebrew-node22.mjs` and support both `/opt/homebrew` and `/usr/local` prefixes.
- The repo provides `npm run check:node22` as a macOS/Homebrew-specific shortcut for the Homebrew `node@22` validation path.
- Additional macOS/Homebrew-backed shortcuts are available for other guarded entrypoints: `npm run dev:node22`, `npm run build:node22`, `npm run preview:node22`, and `npm run astro:node22 -- --version`.

## Summary
- Goals: keep the marketing site and docs hub consistent and ready to ship.
- Current State: docs expansion, navigation cleanup, and automated validation are already in place.
