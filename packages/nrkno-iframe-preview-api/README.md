# @nrk/nrkno-iframe-preview-api

Framework agnostic library for interacting with [IFramePreview](../sanity-plugin-nrkno-iframe-preview/README.md)
in Sanity Studio.

`initPreview` should be used by the app rendered inside the iframe. 

![preview.png](./docs/images/preview.png)
_Figure 1: IFramePreview with desktopMinWidth configured_

See docs in [@nrk/sanity-plugin-nrkno-iframe-preview](../sanity-plugin-nrkno-iframe-preview/README.md) for a detailed description of how this library works.

# Installation

`npm install --save @nrk/nrkno-iframe-preview-api`

# Usage

```ts
import { initPreview } from '@nrk/nrkno-iframe-preview-api'
// Somewhere after page load
const unloadPreview = initPreview<QueryResult | undefined>(
    {
        sanityClientVersion: "2021-06-01",
        // groq SHOULD contain _rev-field projected at the top level
        // if it is not, IFramePreview in Sanity Studio will try to modify the query to include it.
        groqQuery: "* [_type='my-page' && _id == $id]{_rev, ...}[0]",
        queryParams: (doc) => ({id: doc._id}), // default
        initialData: prefetchedData
    },
    (data) => {
        // When this page is loaded by IFramePreview in Sanity Studio,
        // this callback will receive updated data whenever the Studio makes edits.
       
        // If groqQuery was provided, the data will conform to the query
        // If groqQuery was omitted, the data will be the current Studio document
       
        // Use it to update your page in whatever way makes sense.
    }
)
// ... later
// whenever the component that uses the preview is unmounted, ensure to call
unloadPreview()
```

See jsdocs for each config-param for details.

## Sequence diagram for dataflow

![sequence.png](docs/images/sequence.png)
_Figure 2: Sequence diagram for dataflow between Sanity Studio and the iframe_

# Develop

### Test

In this directory

```bash
npm run build
npm link
```

```bash
cd /path/to/your/render/app
npm link  @nrk/sanity-plugin-nrkno-iframe-preview
```

Remember to use localhost url in the Studio to test the IFramePreview component in 
