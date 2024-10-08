# Enonic NextJS Adapter

> NextJS adapter with Guillotine support and basic views

## Installation

```bash
npm i --save @enonic/nextjs-adapter
```

## Usage

All functions and views are split into 4 categories by usage:

- `@enonic/nextjs-adapter` -- can be used both on server and client sides
- `@enonic/nextjs-adapter/server` -- can only be used on server side
- `@enonic/nextjs-adapter/client` -- can only be used on client side
- `@enonic/nextjs-adapter/views/...` -- views folder, every view has its own file with a default export

Here's the usage example in your project:

```tsx
// server-side functions are accessible at /server
import {fetchContent} from "@enonic/nextjs-adapter/server";

// views are placed in a folder called `views` and are default exports in files
import MainView from "@enonic/nextjs-adapter/views/MainView"

// ...
const props = await fetchContent(path, {
    contentPath: '/content/path',
    locale: 'en',
});
// ...

return <MainView {...props}/>
```

## API

### <a id="server-side"></a>Server-side only functions

They are available at `@enonic/nextjs-adapter/server`

<br/>

#### <a id="fetch-content"></a>`fetchContent(contentPath: string | string[], context: Context) => Promise<FetchContentResult>`

Fetches the content/component by path with component queries optimization, page structure as well as runtime info calculation. This is the
main method for querying content.

| Argument | Description       |
|----------|-------------------|
| `context` | Execution context |

Usage:

```tsx
import {fetchContent} from '@enonic/nextjs-adapter/server';
import {headers} from 'next/headers';

const context = {
    contentPath: '/current/content/path',
    locale: 'en',
    headers: headers(),
};

const response = fetchContent(context);
```

Response type:

```tsx
type FetchContentResult = {
    error?: {
        code: string,
        message: string
    } | null;
    data: Record<string, any> | null,       // Result of the content query
    common: Record<string, any> | null,     // Result of the common query
    meta: MetaData,                         // Runtime information
    page: PageComponent | null,             // The structure of the page (not present when rendering single component)
};
```

<br/>

#### <a id="fetch-guillotine"></a>`fetchGuillotine(apiUrl: string, mapping: LocaleMapping, options?: FetchOptions) => Promise<GuillotineResult>`

Makes a custom request to Guillotine. Used by [fetchContent()](#fetch-content) method.

| Argument  | Description                                       |
|-----------|---------------------------------------------------|
| `apiUrl`  | Guillotine API URL                                |
| `mapping` | [Mapping](#locale-mapping-type) locale to project |
| `options` | Request and Next.js config options _(Optional)_   |

Usage:

```tsx
import {fetchGuillotine} from '@enonic/nextjs-adapter/server';
import {getLocaleMapping} from '@enonic/nextjs-adapter';

const apiUrl = 'http://domain:8000/graphql/api';

const mapping = getLocaleMapping({
    contentPath: '/current/content/path',
});

const body = {
    query: 'qraphql query as string',
    variables: {
        foo: 'bar',
    },
};

const headers = {
    'custom-header': 'header-value',
};

const opts = {
    body,
    headers,
    method: 'GET',
    next: {
        revalidate: 60,
        tags: ['tag1', 'tag2'],
    }
};

const result = fetchGuillotine(apiUrl, mapping, opts);
```

Response type:

```tsx
type GuillotineResult = {
    error?: {
        code: string,
        message: string
    } | null;
    [dataKey: string]: any;
};
```

<br/>

#### `fetchFromApi(apiUrl: string, mapping: LocaleMapping, options?: FetchOptions) => Promise<GuillotineResponseJson>`

Makes custom third-party service request. Used by the [fetchGuillotine()](#fetch-guillotine) method.

| Argument  | Description                                       |
|-----------|---------------------------------------------------|
| `apiUrl`  | Service API URL                                   |
| `mapping` | [Mapping](#locale-mapping-type) locale to project |
| `options` | Request and Next.js config options _(Optional)_   |

Usage:

```tsx
import {fetchFromApi} from '@enonic/nextjs-adapter/server';
import {getLocaleMapping} from '@enonic/nextjs-adapter';

const apiUrl = 'http://domain:8000/graphql/api';

const mapping = getLocaleMapping({
    contentPath: '/current/content/path',
});

const body = {
    query: 'qraphql query as string',
    variables: {
        foo: 'bar',
    },
}

const headers = {
    'custom-header': 'header-value',
}

const opts = {
    body,
    headers,
    method: 'POST',
    next: {
        revalidate: 60,
        tags: ['tag1', 'tag2'],
    }
};

const result = fetchFromApi(apiUrl, mapping, opts);
```

<br/>

#### <a id="fetch-paths-for-all-locales"></a>`fetchContentPathsForAllLocales(path: string, query?: string, count?: number) => Promise<ContentPathItem[]>`

Loads all content paths for all locales. Generally used for static site generation.

| Argument | Description                                       |
|----------|---------------------------------------------------|
| `path`   | Root content path                                 |
| `query`  | Request and Next.js config options _(Optional)_ * |
| `count`  | Max result count _(Optional, defaults to 999)_    |

&ast; Default query gets up to `count` results, sorts them by `modifiedTime` and excludes following content types:

```
"base:shortcut", 
"portal:fragment", 
"portal:template-folder", 
"portal:page-template", 
"media:*"
```

Usage:

```tsx
import {fetchContentPathsForAllLocales} from '@enonic/nextjs-adapter/server';

const contentPaths = fetchContentPathsForLocale('/site-name', 'custom graphql query', 1001);
```

<br/>

#### `fetchContentPathsForLocale(path: string, mapping: LocaleMapping, query?: string, count?: number) => Promise<ContentPathItem[]>`

Loads all content paths for the current locale. Generally used for static site generation.
Used by [fetchContentPathsForAllLocales()](#fetch-paths-for-all-locales)

| Argument  | Description                                                                                         |
|-----------|-----------------------------------------------------------------------------------------------------|
| `path`    | Root content path                                                                                   |
| `mapping` | [Mapping](#locale-mapping-type) locale to project                                                   |
| `query`   | Request and Next.js config options _(Optional, [default value here](#fetch-paths-for-all-locales))_ |
| `count`   | Max result count _(Optional, defaults to 999)_                                                      |

Usage:

```tsx
import {fetchContentPathsForLocale} from '@enonic/nextjs-adapter/server';
import {getLocaleMapping} from '@enonic/nextjs-adapter';

const mapping = getLocaleMapping({
    contentPath: '/current/content/path',
});

const contentPaths = fetchContentPathsForLocale('/', mapping, 'custom graphql query', 1001);
```

<br/>

### <a id="client-side"></a>Client-side only functions

They are available at `@enonic/nextjs-adapter/client`

<br/>

#### <a id="locale-context-provider"></a>`<LocaleContextProvider locale="en">`

Create a React.js context that allows child elements to access and modify current locale as well as localize static texts for current
locale. See [useLocaleContext()](#use-locale-context) method for example.

| Argument | Type     | Description                  |
|----------|----------|------------------------------|
| `locale` | `String` | Set the initial locale value |

Usage:

```tsx
import {LocaleContextProvider} from '@enonic/nextjs-adapter/client';

<LocaleContextProvider locale="en"> ...child elements... </LocaleContextProvider>
```

<br/>

#### <a id="use-locale-context"></a>`useLocaleContext() => LocaleContextType`

Methods to access and modify current locale as well as localize static texts, where `LocaleContextType` is:

```tsx
interface LocaleContextType {
    dictionary: Dict
    locale: string
    localize: (key: string, ...args: any[]) => string
    setLocale: (locale: string) => Promise<Dict>
}
```

Usage:

```tsx
'use client';

import {useLocaleContext} from '@enonic/nextjs-adapter/client';

export default function ClientSideComponent() {
    const {locale, localize, setLocale} = useLocaleContext();
    console.log(`Current locale: ${locale}`);
    
    const localizedText = localize('text.key');
    
    setLocale('en').then((dict) => {
        console.log(`New locale: ${locale}`);
    });
    // ...
}
```

<br/>

### <a id="multi-side"></a>Both client and server-side functions

They are available at `@enonic/nextjs-adapter`

<br/>

#### <a id="get-url"></a>`getUrl(url: string, meta: MetaData) => string`

Converts a site-relative or absolute URL to relative one for current viewer (Next.js/Enonic XP). Also takes care of locale if needed.

> **INFO:** For your URLs to work both in Enonic XP and Next.js you need to:
> 1. Query site-relative or absolute URLs from guillotine
> 2. Wrap them with `getUrl()` function in the views

| Argument | Description                                             |
|----------|---------------------------------------------------------|
| `url`    | URL you want to transform                               |
| `meta`   | Runtime data returned by [fetchContent](#fetch-content) |

Usage:

```tsx
import {getUrl} from '@enonic/nextjs-adapter';

const urlRelativeToViewer = getUrl('/some/content/url', meta);
```

<br/>

#### <a id="get-asset"></a>`getAsset(url: string, meta: MetaData) => string`

Converts a local asset URL to relative one for current viewer (Next.js/Enonic XP). It doesn't append locales unlike the [getUrl()](#get-url).

> **INFO:** For your URLs to work both in Enonic XP and Next.js you need to:
> 1. Use relative URL to local asset
> 2. Wrap them with `getAsset()` function in the views

| Argument | Description                                             |
|----------|---------------------------------------------------------|
| `url`    | asset URL you want to transform                         |
| `meta`   | Runtime data returned by [fetchContent](#fetch-content) |

Usage:

```tsx
import {getAsset} from '@enonic/nextjs-adapter';

const urlRelativeToViewer = getAsset('/some/asset/url', meta);
```

<br/>

#### <a id="rich-text-query"></a>`richTextQuery(fieldName: string) => string`

This is a utility function for querying for `RichTextData` needed for [RichTextView](#rich-text-view). It creates a graphql query string for
HTML area input type with given field name.

| Argument    | Description          |
|-------------|----------------------|
| `fieldName` | HTML area field name |

Usage:

```tsx
import {richTextQuery} from '@enonic/nextjs-adapter';

const query = `query($path:ID!){
    guillotine {
        get(key:$path) {
            _path
            type
            ${richTextQuery('htmlField')}
        }
    }
}`;
```

<br/>

#### `validateData(props: FetchContentResult) => void`

Utility method to validate data returned by [fetchContent()](#fetch-content) method. Throws an error or notFound() if data is invalid. Also prevents shortcut content types from being rendered in preview/edit modes.

| Argument | Description                 |
|----------|-----------------------------|
| `props`  | `FetchContentResult` object |

Usage:

```tsx
import {fetchContent} from '@enonic/nextjs-adapter/server';
import {validateData} from '@enonic/nextjs-adapter';

const data = fetchContent({
    contentPath: '/path/to/content',
    locale: 'en',
});

validateData(data);
```

<br/>

### `ComponentRegistry`

Registry containing definitions of all components (i.e. pages, parts, layouts, macros, etc. ). It is used in the runtime by `nextjs-adapter`
to make component queries and render components. It has several public methods:

<br/>

#### `static setCommonQuery(query: SelectedQueryMaybeVariablesFunc): void`

Sets up a common query that is going to be executed along with component queries and passed to every component on the page.

| Argument | Description                           |
|----------|---------------------------------------|
| `query`  | Common [query definition](#query-def) |

Usage:

```tsx
import {ComponentRegistry} from '@enonic/nextjs-adapter';

const query = {
    query: 'graphql query',
    variables: (path, context, config) => {
        return {
            path: path + '/some/processing'
        };
    }
}

ComponentRegistry.setCommonQuery(query);
```

<br/>

#### `static getCommonQuery(): SelectedQueryMaybeVariablesFunc`

Gets the common query definition.

<a id="query-def"></a>Response type:

```tsx
type SelectedQueryMaybeVariablesFunc =
    string |
    QueryGetter |
    {
        query: string | QueryGetter,
        variables: VariablesGetter
    } |
    [string | QueryGetter, VariablesGetter];
```

Usage:

```tsx
import {ComponentRegistry} from '@enonic/nextjs-adapter';

const query = ComponentRegistry.getCommonQuery();
```

<br/>

#### `static getByComponent(component: PageComponent): ComponentDefinition | undefined`

Gets component definition from the ComponentRegistry.

| Argument    | Description                          |
|-------------|--------------------------------------|
| `component` | Page component to get definition for |

Usage:

```tsx
import {ComponentRegistry} from '@enonic/nextjs-adapter';

const definition = ComponentRegistry.getByComponent(component);
```

<a id="comp-def"></a>Response type:

```tsx
interface ComponentDefinition {
    catchAll?: boolean; // set automatically depending on the binding
    query?: SelectedQueryMaybeVariablesFunc,
    configQuery?: string,
    processor?: DataProcessor,
    view?: React.FunctionComponent<any>
}
```

<br/>

#### `static addMacro(name: string, obj: ComponentDefinition): void`

#### `static addPart(name: string, obj: ComponentDefinition): void`

#### `static addLayout(name: string, obj: ComponentDefinition): void`

#### `static addCPage(name: string, obj: ComponentDefinition): void`

#### `static addContentType(name: string, obj: ComponentDefinition): void`

#### `static addComponent(name: string, obj: ComponentDefinition): void`

Saves the component definition in ComponentRegistry by name.

> **NOTE:** <a id="add-comp"></a>`addComponent` is used for defining general types of Enonic XP components by `nextjs-adapter` so you don't
> need to do it manually. Overriding default setup may break Enonic XP integration!

| Argument | Description                       |
|----------|-----------------------------------|
| `name`   | Component name                    |
| `obj`    | [Component definition](#comp-def) |

Usage:

```tsx
import {ComponentRegistry} from '@enonic/nextjs-adapter';

const definition = {}

ComponentRegistry.addMacro('macro-name', definition);
```

<br/>

#### `static getMacro(name: string): ComponentDefinition | undefined`

#### `static getPart(name: string): ComponentDefinition | undefined`

#### `static getLayout(name: string): ComponentDefinition | undefined`

#### `static getPage(name: string): ComponentDefinition | undefined`

#### `static getContentType(name: string): ComponentDefinition | undefined`

#### `static getComponent(name: string): ComponentDefinition | undefined`

Gets the component definition stored in ComponentRegistry by its name.

> **NOTE:** Read [addComponent](#add-comp) note before using `getComponent`.

| Argument | Description    |
|----------|----------------|
| `name`   | Component name |

Usage:

```tsx
import {ComponentRegistry} from '@enonic/nextjs-adapter';

const definition = ComponentRegistry.getMacro('macro-name');
```

Response type: [component definition](#comp-def)

<br/>

#### `static getMacros(): ComponentDefinition[]`

#### `static getParts(): ComponentDefinition[]`

#### `static getLayouts(): ComponentDefinition[]`

#### `static getPages(): ComponentDefinition[]`

#### `static getContentTypes(): ComponentDefinition[]`

#### `static getComponents(): ComponentDefinition[]`

Gets all component definitions stored in ComponentRegistry.

> **NOTE:** Read [addComponent](#add-comp) note before using `getComponents`.

Usage:

```tsx
import {ComponentRegistry} from '@enonic/nextjs-adapter';

const macros = ComponentRegistry.getMacros();
```

Response type: List of [component definitions](#comp-def)

<br/>

### `UrlProcessor`

Helper singleton for processing URLs.

<br/>

#### <a id="process"></a>`static process(url: string, meta: MetaData, serverSide = false, isResource = false): string`

Processes the absolute URL to become relative for the current viewer, while keeping in mind Next.js assets and Enonic XP binary content
links

> **NOTE:** There are convenience aliases to this function called [getUrl()](#get-url) and [getAsset()](#get-asset)

| Argument     | Description                                                                  |
|--------------|------------------------------------------------------------------------------|
| `url`        | Absolute URL                                                                 |
| `meta`       | Runtime data returned by [fetchContent](#fetch-content)                      |
| `serverSide` | Whether URL is going to be used on the server side _(Skips adding basePath)_ |
| `isResource` | Whether URL is a resource _(Skips adding locale)_                            |

Usage:

```tsx
import {UrlProcessor} from '@enonic/nextjs-adapter';

const url = UrlProcessor.process('http://www.some.site.com/url/to/content', meta, true, false);
```

<br/>

#### `static processSrcSet(srcset: string, meta: MetaData): string`

Processes the image srcset attribute to transform each URL with [`process`](#process) method

| Argument | Description                                             |
|----------|---------------------------------------------------------|
| `srcset` | Value of the srcset attribute                           |
| `meta`   | Runtime data returned by [fetchContent](#fetch-content) |

Usage:

```tsx
import {UrlProcessor} from '@enonic/nextjs-adapter';

const url = UrlProcessor.processSrcSet('<srcset value>', meta);
```

<br/>

#### `static setSiteKey(key: string): void`

> **DEPRECATED:** It is automatically done by `nextjs-adapter` now and have no effect.

Sets the site key value that is needed for correct absolute URL processing.

| Argument | Description |
|----------|-------------|
| `key`    | Site key    |

Usage:

```tsx
import {UrlProcessor} from '@enonic/nextjs-adapter';

UrlProcessor.setSiteKey('<site key>');
```

<br/>

#### `static isMediaLink(ref: string, linkData: LinkData[]): boolean`

Checks if link data array contains link with provided ref. Positive result means that this is a link to Enonic XP content.

> **NOTE:** link data array is contained in response of the query generated by [richTextQuery('fieldName')](#rich-text-query)

| Argument   | Description     |
|------------|-----------------|
| `ref`      | Link ref        |
| `linkData` | Link data array |

Usage:

```tsx
import {UrlProcessor} from '@enonic/nextjs-adapter';

UrlProcessor.isMediaLink('<link ref>', linkData);
```

<br/>

#### `static isContentImage(ref: string, imageData: ImageData[]): boolean`

Checks if image data array contains image with provided ref. Positive response means that this is an Enonic XP image.

> **NOTE:** image data array is contained in response of the query generated by [richTextQuery('fieldName')](#rich-text-query)

| Argument    | Description      |
|-------------|------------------|
| `ref`       | Image ref        |
| `imageData` | Image data array |

Usage:

```tsx
import {UrlProcessor} from '@enonic/nextjs-adapter';

UrlProcessor.isContentImage('<image ref>', imageData);
```

<br/>

### Enonic XP locale mapping functions

In order to create association between locale and Enonic XP project, `ENONIC_MAPPINGS` environment variable should be set.
Functions for reading those mappings are available at `@enonic/nextjs-adapter`.

<br/>

#### `getLocaleMapping(context: Context): LocaleMapping`

| Argument  | Description      |
|-----------|------------------|
| `context` | `Context` object |

Usage:

```tsx
import {getLocaleMapping} from '@enonic/nextjs-adapter';

const mapping = getLocaleMapping({
    contentPath: '/current/content/path',
    locale: 'en',
});
```

<a id="locale-mapping-type"></a>Response type:

```tsx
export interface LocaleMapping {
    default: boolean
    project: string
    site: string
    locale: string
}
```

<br/>

#### `getLocaleMappingByProjectId(projectId?: string, useDefault = true): LocaleMapping`

| Argument     | Description                                                |
|--------------|------------------------------------------------------------|
| `projectId`  | Enonic project ID _(Optional)_                             |
| `useDefault` | Use default locale as fallback _(Optional, default: true)_ |

Usage:

```tsx
import {getLocaleMappingByProjectId} from '@enonic/nextjs-adapter';

const mapping = getLocaleMappingByProjectId('project-id', true);
```

[Response type](#locale-mapping-type)

<br/>

#### `getLocaleMappingByLocale(locale?: string, useDefault = true): LocaleMapping`

| Argument     | Description                                                |
|--------------|------------------------------------------------------------|
| `locale`     | locale ID _(Optional)_                                     |
| `useDefault` | Use default locale as fallback _(Optional, default: true)_ |

Usage:

```tsx
import {getLocaleMappingByLocale} from '@enonic/nextjs-adapter';

const mapping = getLocaleMappingByLocale('en', true);
```

[Response type](#locale-mapping-type)

<br/>

#### `getRequestLocaleInfo(context: Context): LocaleMapping`

Attempts to get the locale info from the request. Along with that it also returns the default locale and all configured locales.

| Argument  | Description      |
|-----------|------------------|
| `context` | `Context` object |

Usage:

```tsx
import {getRequestLocaleInfo} from '@enonic/nextjs-adapter';

const mapping = getRequestLocaleInfo({
    contentPath: '/current/content/path',
    locale: 'en',
});
```

Response type:

```tsx
interface LocaleInfo {
    locale: string,
    locales: string[],
    defaultLocale: string
}
```

<br/>

### `I18n` localization functions

These functions can be used both on server and client sides, but it is recommended to
use [native React.js context](#locale-context-provider) classes for client-side localization.

<br/>

#### `static I18n.setLocale(locale: string): Promise<Dict>`

Sets the current locale and returns the dictionary for it.

| Argument | Description          |
|----------|----------------------|
| `locale` | Locale id, i.e. `en` |

Usage:

```tsx
import {I18n} from '@enonic/nextjs-adapter';

const dict = await I18n.setLocale('en');
```

<a id="dict-type"></a>Response type:

```tsx
interface Dict {
    [key: string]: string
}
```

<br/>

#### `static I18n.localize(key: string, ...args: any[]): string`

Localizes the static text by key and replaces placeholders with provided arguments.

| Argument  | Description        |
|-----------|--------------------|
| `key`     | text key           |
| `...args` | template arguments |

Usage:

```tsx
import {I18n} from '@enonic/nextjs-adapter';

const localizedText = I18n.localize('text.key', 'value1', 'value2');
```

<br/>

#### `static I18n.getLocale(): string`

Returns the current locale.

Usage:

```tsx
import {I18n} from '@enonic/nextjs-adapter';

const locale = I18n.getLocale();
```

<br/>

#### `static I18n.getDictionary(): Dict`

Returns dictionary for the current locale.

Usage:

```tsx
import {I18n} from '@enonic/nextjs-adapter';

const dict = I18n.getDictionary();
```

[Response type](#dict-type)

<br/>

### Utility functions

There is also a number of utility constants and functions available at `@enonic/nextjs-adapter`.

<br/>

```tsx
import {CATCH_ALL} from './constants';

IS_DEV_MODE;                // True if current mode == development

APP_NAME;                   // Name of the app defined in .env files

APP_NAME_UNDERSCORED;       // APP_NAME with underscores instead of dots

APP_NAME_DASHED;            // APP_NAME with dashes instead of dots

CATCH_ALL;                  // Catch all component name

PORTAL_COMPONENT_ATTRIBUTE; // Portal component attribute name

PORTAL_REGION_ATTRIBUTE;    // Portal region attribute name

JSESSIONID_HEADER;          // JSESSIONID header name

PROJECT_ID_HEADER;          // Project ID header name

RENDER_MODE_HEADER;         // Render mode header name

XP_BASE_URL_HEADER;         // XP base URL header name

enum XP_REQUEST_TYPE {      // Enum for XP request types
    COMPONENT = 'component',
    TYPE = 'type',
    PAGE = 'page',
}

enum RENDER_MODE {          // Enum for render modes
    INLINE = 'inline',
    EDIT = 'edit',
    PREVIEW = 'preview',
    LIVE = 'live',
    ADMIN = 'admin',
    NEXT = 'next',
}

enum XP_COMPONENT_TYPE {    // Enum for XP component types
    PART = 'part',
    LAYOUT = 'layout',
    TEXT = 'text',
    FRAGMENT = 'fragment',
    PAGE = 'page',
}

// Sanitizes text according to graphql naming spec http://spec.graphql.org/October2021/#sec-Names
const sanitizeGraphqlName = (text: string) => string;

// Returns full content api URL with current project and branch appended
const getContentApiUrl = (context: Context) => string;
```

### Views

They are located in `@enonic/nextjs-adapter/views` folder. Each view is a default export in the corresponding file.

<br/>

#### `<MainView common="common" data="data" page="page" meta="meta">`

The main view of the application. It accepts the result of [fetchContent](#fetch-content) method and is intended to be used as a view for your [next.js route](https://nextjs.org/docs/routing/introduction)

| Argument | Type                              | Description                 |
|----------|-----------------------------------|-----------------------------|
| `common` | `Record<string, any> &#124; null` | Result of the common query  |
| `data`   | `Record<string, any> &#124; null` | Result of the graphql query |
| `page`   | `PageComponent &#124; null`       | Page structure              |
| `meta`   | `MetaData`                        | Runtime info                |

Usage:

```tsx
import MainView from '@enonic/nextjs-adapter/views/MainView';
import fetchContent from '@enonic/nextjs-adapter';

export async function getServerSideProps(context: Context) {
    const props = fetchContent('/content/path', context);
    return {
        props
    }
}

export default MainView;
```

<br/>

#### `<StaticContent condition="true" tag="div">`

Tag for disabling client side hydration if the condition is true. This will remove interactivity from children.

| Argument           | Type      | Description                        |
|--------------------|-----------|------------------------------------|
| `condition = true` | `Boolean` | Condition to trigger static output |
| `tag = 'div'`      | `String`  | Html tag to use for static output  |

Usage:

```tsx
import StaticContent from '@enonic/nextjs-adapter/views/StaticContent';

<StaticContent condition={true} tag="div"> ...child elements... </StaticContent>
```

<br/>

#### <a id="rich-text-view"></a>`<RichTextView className="css-class" tag="section" data={data} meta={meta}, renderMacroInEditMode="true", customReplacer={customReplacerFn}>`

Tag for displaying contents of html area input types. Takes care of processing macros, URLs and images inside.

| Argument                       | Type           | Description                                                                                       |
|--------------------------------|----------------|---------------------------------------------------------------------------------------------------|
| `data`                         | `RichTextData` | Rich text data                                                                                    |
| `meta`                         | `MetaData`     | Runtime data returned by fetchContent method.                                                     |
| `customReplacer`               | `Replacer`     | Function to do custom element processing. Not invoked for image, link and macro nodes. _Optional_ |
| `className`                    | `String`       | Class name to add to the root html element. _Optional_                                            |
| `renderMacroInEditMode = true` | `boolean`      | Flag passed to macros telling if they should render themselves in edit mode                       |
| `tag = 'div'`                  | `String`       | Html tag to use as a root                                                                         |

> **TIP!** There is a utility function [richTextQuery(fieldName)](#rich-text-query) generating part of the graphql query to
> obtain `RichTextData` for html area input types.

Usage:

```tsx
import RichTextView from '@enonic/nextjs-adapter/views/RichTextView';

<RichTextView data={richTextData} meta={meta} tag="section" className="rich-text-view" renderMacroInEditMode="false"></RichTextView>
```

<br/>

#### `<Regions page={page} meta={meta} name="main" common={common}>`

Tag for rendering page regions. It is useful when implementing custom page views.
All necessary data can be acquired by running [fetchContent()](#fetch-content)

| Argument | Type                    | Description                         |
|----------|-------------------------|-------------------------------------|
| `page`   | `PageData &#124; null;` | Page structure                      |
| `meta`   | `MetaData`              | Runtime info                        |
| `name`   | `String`                | Render only this region. _Optional_ |
| `common` | `any`                   | Result of common query. _Optional_  |

Usage:

```tsx
import StaticContent from '@enonic/nextjs-adapter/views/StaticContent';

<StaticContent condition={true} tag="div"> ...child elements... </StaticContent>
```
