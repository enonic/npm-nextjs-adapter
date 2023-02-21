# Enonic NextJS Adapter

> NextJS adapter with Guillotine support and basic views

## Installation

---

```bash
npm i --save @enonic/nextjs-adapter
```

## Usage

---

Just import required functions and views in your project:

```tsx
// all functions and interfaces are accessible at the library root
import {fetchContent} from "@enonic/nextjs-adapter";

// views are placed in a folder called `views` and are default exports in files
import MainView from "@enonic/nextjs-adapter/views/MainView"

// ...
const props = await fetchContent(path, context);
// ...

return <MainView {...props}/>
```

## API

---

### Functions

They are available at the library root at `@enonic/nextjs-adapter`

#### <a id="fetch-content"></a>`fetchContent(contentPath: string | string[], context: Context) => Promise<FetchContentResult>`

Fetches the content/component by path with component queries optimization, page structure as well as runtime info calculation. This is the
main method for querying content.

| Argument  | Description                           |
|-----------|---------------------------------------|
| `path`    | Path to content                       |
| `context` | Execution context provided by Next.js |

Usage:

```tsx
import {fetchContent} from '@enonic/nextjs-adapter';

const response = fetchContent('/path/to/content', context);
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

---

#### <a id="fetch-guillotine"></a>`fetchGuillotine(apiUrl: string, body: ContentApiBaseBody, headers?: {}) => Promise<GuillotineResult>`

Makes a custom request to Guillotine. Used by [fetchContent()](#fetch-content) method.

| Argument  | Description                                             |
|-----------|---------------------------------------------------------|
| `apiUrl`  | Guillotine API URL                                      |
| `body`    | Body of the request                                     |
| `headers` | Object of custom headers with string values. _Optional_ |

Usage:

```tsx
import {fetchGuillotine} from '@enonic/nextjs-adapter';

const body = {
    query: 'qraphql query as string',
    variables: {
        foo: 'bar',
    },
};

const headers = {
    'custom-header': 'header-value',
};

const result = fetchGuillotine('http://domain:8000/graphql/api', body, headers);
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

---

#### `fetchFromApi(apiUrl: string, body: ContentApiBaseBody, headers?: {}, method?: string) => Promise<any>`

Makes custom third-party service request. Used by the [fetchGuillotine()](#fetch-guillotine) method.

| Argument  | Description                                                                        |
|-----------|------------------------------------------------------------------------------------|
| `apiUrl`  | Service API URL                                                                    |
| `body`    | Body of the request                                                                |
| `headers` | Object of custom headers with string values. _Optional_                            |
| `method`  | Method of the request: `HEAD`, `POST`, `GET`, etc. _Optional, defaults to `POST`._ |

Usage:

```tsx
import {fetchFromApi} from '@enonic/nextjs-adapter';

const body = {
    query: 'qraphql query as string',
    variables: {
        foo: 'bar',
    },
}

const headers = {
    'custom-header': 'header-value',
}

const result = fetchFromApi('http://domain:8000/graphql/api', body, headers, 'GET');
```

---

#### `getUrl(url: string, meta: MetaData) => string`

Converts an absolute URL to the relative one for current viewer (Next.js/Enonic XP).

> **INFO:** For your URLs to work both in Enonic XP and Next.js you need to:
> 1. Query absolute URLs from guillotine
> 2. Wrap them with `getUrl()` function in the views

| Argument | Description                                             |
|----------|---------------------------------------------------------|
| `url`    | URL you want to transform                               |
| `meta`   | Runtime data returned by [fetchContent](#fetch-content) |

Usage:

```tsx
import {getUrl} from '@enonic/nextjs-adapter';

const urlRelativeToViewer = getUrl('http://domain:8000/graphql/api', meta);
```

---

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

### `ComponentRegistry`

Registry containing definitions of all components (i.e. pages, parts, layouts, macros, etc. ). It is used in the runtime by `nextjs-adapter`
to make component queries and render components. It has several public methods:

---

#### `setCommonQuery(query: SelectedQueryMaybeVariablesFunc): void`

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

---

#### `getCommonQuery(): SelectedQueryMaybeVariablesFunc`

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

---

#### `getByComponent(component: PageComponent): ComponentDefinition | undefined`

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

---

#### `addMacro(name: string, obj: ComponentDefinition): void`

#### `addPart(name: string, obj: ComponentDefinition): void`

#### `addLayout(name: string, obj: ComponentDefinition): void`

#### `addCPage(name: string, obj: ComponentDefinition): void`

#### `addContentType(name: string, obj: ComponentDefinition): void`

#### `addComponent(name: string, obj: ComponentDefinition): void`

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

---

#### `getMacro(name: string): ComponentDefinition | undefined`

#### `getPart(name: string): ComponentDefinition | undefined`

#### `getLayout(name: string): ComponentDefinition | undefined`

#### `getPage(name: string): ComponentDefinition | undefined`

#### `getContentType(name: string): ComponentDefinition | undefined`

#### `getComponent(name: string): ComponentDefinition | undefined`

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

---

#### `getMacros(): ComponentDefinition[]`

#### `getParts(): ComponentDefinition[]`

#### `getLayouts(): ComponentDefinition[]`

#### `getPages(): ComponentDefinition[]`

#### `getContentTypes(): ComponentDefinition[]`

#### `getComponents(): ComponentDefinition[]`

Gets all component definitions stored in ComponentRegistry.

> **NOTE:** Read [addComponent](#add-comp) note before using `getComponents`.

Usage:

```tsx
import {ComponentRegistry} from '@enonic/nextjs-adapter';

const macros = ComponentRegistry.getMacros();
```

Response type: List of [component definitions](#comp-def)

### `UrlProcessor`

Helper singleton for processing URLs.

---

#### <a id="process"></a>`static process(url: string, meta: MetaData): string`

Processes the absolute URL to become relative for the current viewer, while keeping in mind Next.js assets and Enonic XP binary content
links

> **NOTE:** There is an alias to this function called `getUrl()` available at `@enonic/nextjs-adapter`

| Argument | Description                                             |
|----------|---------------------------------------------------------|
| `url`    | Absolute URL                                            |
| `meta`   | Runtime data returned by [fetchContent](#fetch-content) |

Usage:

```tsx
import {UrlProcessor} from '@enonic/nextjs-adapter';

const url = UrlProcessor.process('http://www.some.site.com/url/to/content', meta);
```

---

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

---

#### `static setSiteKey(key: string): void`

Sets the site key value that is needed for correct URL processing. It is automatically done by `nextjs-adapter` so you don't have to do it.

> **WARNING:** Overriding this value may result in wrong URL processing !

| Argument | Description |
|----------|-------------|
| `key`    | Site key    |

Usage:

```tsx
import {UrlProcessor} from '@enonic/nextjs-adapter';

UrlProcessor.setSiteKey('<site key>');
```

---

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

---

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

### Utility functions

There is also a number of utility variables and functions available at `@enonic/nextjs-adapter`.

---

```tsx
IS_DEV_MODE;            // True if current mode == development

APP_NAME;               // Name of the app defined in .env files

APP_NAME_UNDERSCORED;   // APP_NAME with underscores instead of dots

APP_NAME_DASHED;        // APP_NAME with dashes instead of dots

SITE_KEY;               // Site key defined in .env files

enum XP_REQUEST_TYPE {
    COMPONENT = 'component',
    TYPE = 'type',
    PAGE = 'page',
}

enum RENDER_MODE {
    INLINE = 'inline',
    EDIT = 'edit',
    PREVIEW = 'preview',
    LIVE = 'live',
    ADMIN = 'admin',
    NEXT = 'next',
}

enum XP_COMPONENT_TYPE {
    PART = 'part',
    LAYOUT = 'layout',
    TEXT = 'text',
    FRAGMENT = 'fragment',
    PAGE = 'page',
}

// Sanitizes text according to graphql naming spec http://spec.graphql.org/October2021/#sec-Names
const sanitizeGraphqlName = (text: string) => string;

// Returns common part of 2 strings
const commonChars = (s1?: string, s2?: string) => string;
```

### Views

They are located in `@enonic/nextjs-adapter/views` folder. Each view is a default export in the corresponding file.

---

#### `<MainView common="common" data="data" page="page" meta="meta">`

The main view of the application. It accepts the result of [fetchContent](#fetch-content) method.
Should be default export from your [next.js route](https://nextjs.org/docs/routing/introduction)

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

---

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

---

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

---

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

## Known problems

---

In some cases, when using in NextJS application, a build errors related to the JSX may appear, that state the following:
```
You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
```
To prevent these errors, it is necessary to transpile the library using something
like [`next-transpile-modules`](https://www.npmjs.com/package/next-transpile-modules).
Install it as dev dependency and call it explicitly from you NextJS config:

`next.config.js`
```js
const withTM = require('next-transpile-modules')(['@enonic/nextjs-adapter']);

module.exports = withTM({});
```