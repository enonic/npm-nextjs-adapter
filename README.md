# Enonic NextJS Adapter

> NextJS adapter with Guillotine support and basic views

## Install

```bash
npm i --save @enonic/nextjs-adapter
```

## Use

Just import required functions and types in your project:

```tsx
import {fetchContent} from "@enonic/nextjs-adapter/guillotine/fetchContent";

// ...

const {page} = await fetchContent(path, context);

```

## Problems

In some cases, when using in NextJS application, a build errors related to the JSX may appear, that state the following:
```
You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
```

To prevent these errors, it is necessary to transpile the library using something like [`next-transpile-modules`](https://www.npmjs.com/package/next-transpile-modules). 
Install it as dev dependency and call it explicitly from you NextJS config:

`next.config.js`
```js
const withTM = require('next-transpile-modules')(['@enonic/nextjs-adapter']);

module.exports = withTM({});
```