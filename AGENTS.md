# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview

`@enonic/nextjs-adapter` is an npm library that bridges Next.js applications with Enonic XP's Guillotine GraphQL API. It provides
server-side data fetching, client-side locale context, URL processing, a component registry, and a set of React views for rendering Enonic
XP content (pages, parts, layouts, macros, fragments, rich text).

The library is published to npm with three entry points:

- `@enonic/nextjs-adapter` — shared (server + client) exports
- `@enonic/nextjs-adapter/server` — server-only exports (data fetching)
- `@enonic/nextjs-adapter/client` — client-only exports (React context for locale)
- `@enonic/nextjs-adapter/views/*` — individual React view components

## Build, Test, and Lint Commands

```sh
npm run build        # TypeScript compilation (tsc) to dist/
npm test             # Jest tests with coverage (cleans coverage dir first)
npm run lint         # ESLint (quiet mode, cached) on src/
npm run lint:fix     # ESLint with auto-fix
npm run check:types  # Type-check without emitting (tsc --noEmit)
npm run clean        # Remove dist/ and .tgz files
npm run prepack      # Runs test, lint, and build concurrently (used before npm pack/publish)
```

Run a single test file:

```sh
npx jest --no-cache test/guillotine/fetchContent.test.ts
```

## Test Configuration

Jest is configured in `jest.config.ts` with **two test projects**:

1. **Edge runtime** (`@edge-runtime/jest-environment`) — runs `test/**/*.(spec|test).{ts,tsx}` files
2. **jsdom** — runs `test/**/*.(spec|test).client.{ts,tsx}` files (client-side component tests)

Both projects use `ts-jest` for TypeScript and `babel-jest` for plain JS (needed to transform `gqlmin` ESM dependency). Test-specific
TypeScript config is at `test/tsconfig.json` (extends root, adds `"jsx": "react-jsx"`).

The `gqlmin` package must be listed in `transformIgnorePatterns` exceptions since it ships as ESM only.

## Architecture

### Entry Points and Compilation

`tsconfig.json` explicitly lists four entry-point files (`src/index.ts`, `src/client.ts`, `src/server.ts`, `src/baseMappings.ts`) and
includes `src/views/**` and `src/utils/**` via glob. Output goes to `dist/` with declarations and source maps. JSX is set to `"preserve"` (
consumed by Next.js).

### Source Layout (`src/`)

- **`common/`** — Core singletons and constants used throughout:
    - `ComponentRegistry` — static registry mapping component names to definitions (views, queries, processors). Central to how pages are
      assembled.
    - `UrlProcessor` — transforms URLs between Enonic XP and Next.js contexts, handling base paths, locales, and render modes.
    - `constants.ts` — enums (`RENDER_MODE`, `XP_COMPONENT_TYPE`, `XP_REQUEST_TYPE`), header names, and the static-paths GraphQL query.
    - `env.ts` — reads required environment variables (`ENONIC_API`, `ENONIC_APP_NAME`, `ENONIC_MAPPINGS`) with server/client awareness (
      `NEXT_PUBLIC_` prefix for client). Throws on missing values.

- **`guillotine/`** — Server-side data fetching pipeline (the largest module):
    - `fetchContent.ts` — the primary entry point. Performs a **two-phase Guillotine call**: first fetches metadata (content type,
      components tree), then builds an optimized combined query for content + component data in a single request.
    - The pipeline: `fetchMetaData` → `restrictComponentsToPath` → `processComponentConfig` → `collectComponentDescriptors` →
      `combineMultipleQueries` → `fetchContentData` → `applyProcessors` → `buildPage` → `createMetaData`.
    - `combineMultipleQueries.ts` — merges content-type, common, and per-component queries into one GraphQL request with aliased fields.
    - `fetchGuillotine.ts` — Guillotine-specific fetch wrapper; minifies queries with `gqlmin` before sending.
    - `fetchFromApi.ts` — generic HTTP fetch to any API.
    - `metadata/` — GraphQL query fragments for fetching component metadata and rich text data.

- **`views/`** — React components for rendering Enonic XP page structures:
    - `MainView` — top-level view accepting `FetchContentResult`.
    - `BaseComponent` — dispatches rendering based on component type and registry lookup.
    - `BasePage`, `BasePart`, `BaseLayout` — default renderers for XP component types.
    - `Region` / `Regions` — renders page regions with their child components.
    - `RichTextView` — renders HTML area content with macro, image, and link processing.
    - `StaticContent` — disables client-side hydration for its children.
    - `macros/` — default macro views (`DefaultMacro`, `DisableMacro`).

- **`baseMappings.ts`** — registers default component definitions (base pages, parts, layouts, fragments, text, macros) in
  `ComponentRegistry`. Imported as a side-effect.

- **`i18n/`** — Localization: `I18n` class for server-side use and `LocaleContext` React context for client-side.

- **`utils/`** — Stateless helper functions for headers, locale mapping, render mode detection, URL manipulation, logging.

- **`types/`** — TypeScript type definitions split by domain (`guillotine.ts`, `component.ts`, `componentProps.ts`, `next.ts`, `i18n.ts`,
  `util.ts`).

### Key Patterns

- **ComponentRegistry** is a static singleton — components register themselves by calling `ComponentRegistry.addPart(...)`,
  `.addLayout(...)`, etc. Consumer apps register their own components at import time, and `baseMappings.ts` registers the built-in defaults.
- **Two-phase fetch in `fetchContent`**: metadata call discovers the content type and page structure, then a combined query fetches all
  content + component data in a single request.
- **Server/client boundary**: `src/client.ts` is marked with `'use client'` directive. Server-only code uses Next.js `headers()` and
  `draftMode()`.
- **Environment variables** are required at module load time — `ENONIC_API`, `ENONIC_APP_NAME`, `ENONIC_MAPPINGS` must be set (prefixed with
  `NEXT_PUBLIC_` for client-side access).

### Peer Dependencies

This library expects the consuming project to provide `next` (^16), `react` (^19), `react-dom` (^19), and `html-react-parser` (^5).

## ESLint

Uses `@enonic/eslint-config` as base with React and TypeScript plugins. Key deviations: `no-explicit-any` and several `@typescript-eslint`
safety rules are turned off. The `dist/` directory and `.js` files are ignored.

## Node Version

Requires Node >= 22.15.1 and npm >= 10.9.2 (see `engines` in `package.json`).
