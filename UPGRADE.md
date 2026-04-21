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

Read `process.env.ENONIC_API` directly, or rely on `fetchContent` to route
the request for you.

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
holds the site path previously derived from the locale mapping and is what
`UrlProcessor` uses for base-URL normalization.

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

### 5. `UrlProcessor.setSiteKey` removed

**Why**

The site key is now carried on `meta.site` per-request, so a global setter is no longer needed.

**Migration**

Remove all `UrlProcessor.setSiteKey(...)` calls. The site key comes from
`meta.site`.

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
- `encryptParams(value)` / `decryptParams(cipher)` — symmetric helpers for
  encrypting URL params using the app's configured secret.

---

## Suggested upgrade checklist

1. Replace `getAsset(url, meta)` with the plain `url`.
2. Replace `getContentApiUrl(...)` with reads of `process.env.ENONIC_API`.
3. Replace `meta.apiUrl` with `meta.project` / `meta.site` / `meta.branch`.
4. Update every registered `QueryGetter` / `VariablesGetter` / common query
   to destructure `{path, siteKey, branch, project}`; returned variables
   must include the full `GlobalVariables` shape.
5. Remove any `UrlProcessor.setSiteKey(...)` calls.
6. Remove `renderInEditMode` on `BaseMacro` and `renderMacroInEditMode` on
   `RichTextView`; update custom `Replacer` functions to the new
   `(domNode, data, meta)` signature.
7. Audit `meta.renderMode === 'edit'` branches — draft-mode requests will
   now hit them.
