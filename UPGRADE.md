# Upgrade Notes

This document lists end-user API changes for the next major release of `@enonic/nextjs-adapter`.

---

## Breaking changes

### 1. `getAsset` removed

**Why**

The adapter now targets the `Next.js Preview` widget, which serves pages from
the Next.js server directly. Static assets can therefore keep their original
relative URLs — no wrapper is needed.

**Migration**

```ts
// before
import {getAsset} from '@enonic/nextjs-adapter';

const assetUrl = getAsset('/some/asset/url', meta);

// after
const assetUrl = '/some/asset/url';
```

---

### 2. `getContentApiUrl` removed

**Why**

All locales and branches share a single Guillotine endpoint.

**Migration**

Rely on `fetchContent` to route the request for you. If you need the endpoint
yourself, it is `ENONIC_API` (the XP API root, e.g.
`http://localhost:8080/api`) + `/` + `GUILLOTINE_API` (default
`com.enonic.app.guillotine:graphql`).

---

### 3. `MetaData`: `apiUrl` replaced with `project` / `site` / `branch`

```diff
 export interface MetaData {
     ...
-    apiUrl: string,
+    branch: string,
+    project: string,
+    site: string,
     baseUrl: string,
     locale: string,
     defaultLocale: string
 }
```

**Why**

A single API endpoint may now serve multiple XP projects, sites, and
branches. Exposing them on `MetaData` lets views and URL builders route
without reaching into locale mappings.

**Migration**

Replace `meta.apiUrl` reads with the appropriate new field. `meta.site`
holds the site path previously derived from the locale mapping.

---

### 4. `QueryGetter` / `VariablesGetter` signatures change

```diff
-export type QueryGetter = (path: string, context?: Context, config?: any) => string;
+export interface GlobalVariables {
+    path: string;
+    siteKey: string;
+    branch: string;
+    project: string;
+}
+export type QueryGetter = (vars: GlobalVariables, context?: Context, config?: any) => string;

-export type VariablesGetter = (path: string, context?: Context, config?: any) => VariablesGetterResult;
+export type VariablesGetter = (vars: GlobalVariables, context?: Context, config?: any) => VariablesGetterResult;

-export interface VariablesGetterResult {
-    [variables: string]: any
-    path: string
-}
+export type VariablesGetterResult = GlobalVariables & Record<string, any>;
```

**Why**

Guillotine queries now require `siteKey`, `branch`, and `project` as
variables to resolve content against the correct project and branch (see
#3). Passing these alongside `path` lets user-defined queries reference
them directly.

**Migration**

Every custom query/variables function registered with `ComponentRegistry`
(per-page, per-part, per-content-type, or via `setCommonQuery`) must be
updated:

```ts
// before
ComponentRegistry.setCommonQuery((path) => `query($path:ID!){...}`);
const getVars: VariablesGetter = (path) => ({path, extra: 'x'});

// after
ComponentRegistry.setCommonQuery(({path, siteKey, branch, project}) =>
    `query($path:ID!, $siteKey:ID!, $branch:String!, $project:String!){...}`);
const getVars: VariablesGetter = (vars) => ({...vars, extra: 'x'});
```

---

### 5. `UrlProcessor` and `getUrl` removed

**Why**

Guillotine 9 returns URL objects (`{url, path, queryString, ...}`) instead
of strings, so URLs are built from their parts: media URLs from
`ENONIC_MEDIA_CDN` (default `ENONIC_API`) + `path`, page URLs from the
locale (omitted for the default locale) + site-relative `path`.

**Migration**

Query URL fields with `imageUrlQuery(args)`, `mediaUrlQuery()`,
`attachmentUrlQuery()` and `pageUrlQuery()` (they select every field), and
render the results with `imageUrl(data)`, `mediaUrl(data)`,
`attachmentUrl(data)` and `pageUrl(data, meta)`; they only need `path`
(`queryString` is optional). `RichTextView` rewrites `processedHtml` URLs itself. In
`/api/mappings`, return
`localizeMappings(mappings, localeMapping)` so targets of non-default locales carry the prefix.
Remove `UrlProcessor.setSiteKey(...)`, `UrlProcessor.process(...)` and
`getUrl(...)` calls.

---

### 6. `renderInEditMode` / `renderMacroInEditMode` props removed

- `BaseMacroProps.renderInEditMode` — removed.
- `RichTextViewProps.renderMacroInEditMode` — removed.
- `Replacer` function signature is now `(domNode, data, meta) => ReplacerResult`.

**Why**

With the `Next.js Preview` widget, Content Studio's inline editor renders
pages through the same Next.js runtime as live traffic, so the special
raw-markup path for EDIT mode is unnecessary.

**Migration**

Drop the removed props from your JSX and update any custom `Replacer`
function to the three-argument signature. If you need a different EDIT-mode
preview for a specific macro, branch on `meta.renderMode === RENDER_MODE.EDIT`
inside that macro's own view.

---

### 7. Draft cookie forces `renderMode = EDIT`

When Next.js `draftMode()` is active (draft cookie present), `fetchContent`
now injects `RENDER_MODE = EDIT` for downstream code.

**Why**

Draft mode is the preview channel for unpublished content; aligning it with
EDIT render mode makes drafts render the way Content Studio expects.

**Migration**

Audit any code that switches on `meta.renderMode`. Draft-mode requests will
now take the EDIT branch instead of NEXT/LIVE.

---

## Non-breaking changes

New public exports, safe to adopt incrementally:

- `getContentBranch(context)` — resolves the XP branch for a request.
- `encryptParams(params, secret)` / `decryptParams(blob, secret)` — symmetric
  AES-256-GCM helpers for encrypting URL params. The caller supplies the
  `secret` (typically `process.env.ENONIC_API_TOKEN`); it is hashed with
  SHA-256 to derive the key, so any string length works. `decryptParams`
  returns `null` for malformed, tampered, or wrong-secret inputs.
- `NEXT_PUBLIC_ENONIC_API`, `NEXT_PUBLIC_ENONIC_APP_NAME`,
  `NEXT_PUBLIC_ENONIC_MAPPINGS` and `NEXT_PUBLIC_ENONIC_API_TOKEN` are no
  longer read. `ENONIC_API`, `ENONIC_APP_NAME` and `ENONIC_MAPPINGS` are
  validated on the server only and resolve to `undefined` in the browser, so
  the `NEXT_PUBLIC_` mirrors can be removed from `.env`.
- `ENONIC_API` now holds the XP API root instead of the Guillotine endpoint;
  the optional `GUILLOTINE_API` and `ENONIC_MEDIA_CDN` complete it.

---

## Suggested upgrade checklist

1. Replace `getAsset(url, meta)` with the plain `url`.
2. Remove `getContentApiUrl(...)`; point `ENONIC_API` at the XP API root.
3. Replace `meta.apiUrl` with `meta.project` / `meta.site` / `meta.branch`.
4. Update every registered `QueryGetter` / `VariablesGetter` / common query
   to destructure `{path, siteKey, branch, project}`; returned variables
   must include the full `GlobalVariables` shape.
5. Replace `UrlProcessor` / `getUrl` usage with the `*UrlQuery()` / `*Url()`
   pairs and add `localizeMappings()` to `/api/mappings`.
6. Remove `renderInEditMode` on `BaseMacro` and `renderMacroInEditMode` on
   `RichTextView`; update custom `Replacer` functions to the new
   `(domNode, data, meta)` signature.
7. Audit `meta.renderMode === 'edit'` branches — draft-mode requests will
   now hit them.
8. Remove the `NEXT_PUBLIC_ENONIC_*` lines from `.env`.
