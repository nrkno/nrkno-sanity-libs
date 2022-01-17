# @nrk/sanity-plugin-nrkno-iframe-preview

Liveupdated iframe preview component for Sanity Studio, compatible with any framework.

Queries are executed by Sanity Studio and passed to the iframe. 
This has the beneficial in that the render-app in the iframe
does not need to listen for sanity client updates itself.

![preview.png](./docs/images/preview.png)
_Figure 1: IFramePreview with desktopMinWidth configured_

The app running in the iframe should use `@nrk/nrkno-iframe-preview-api`, 
which allows it to specify a GROQ-query for the Studio to execute.

The result of the query will be sent to the iframe whenever the query
revision matches the studio revision (ie. whenever the data changes).

This means that the render app does not need to listen for changes itself, as
data flows directly from the Studio via iframe.postMessage.

# Installation
In Sanity studio project run:

`npx sanity install @nrk/sanity-plugin-nrkno-iframe-preview`

This will install & add the plugin to sanity.json plugin array.

## At-a-glance

* Use IFramePreview component in studio structure view.
    * Configure with render-app preview-url.
    * Optionally configure desktopMinWidth.
* Use [nrkno-sanity-iframe-preview-api](../nrkno-iframe-preview-api/README.md) in the render-app.
    * Configure a groq-query (or just use document directly from Sanity Studio as is).
* Enjoy live-updated preview in Studio, with queries executed by the Studio on behalf of the render app.

## Usage
Should be used as part of Sanity Studio StructureBuilder code:
```ts
import { IFramePreview } from '@nrk/sanity-plugin-nrkno-iframe-preview'

S.view
  .component(IFramePreview)
  .options({
      url: (doc: SanityDocument) => 'iframe-url', // (doc) => (string | Promise<string>)
      mapDocument: (doc: SanityDocument) => ({ _id: doc._id }),
      desktopMinWidth: 900,
   })   
  .icon(EyeIcon)
  .id("preview")
  .title("Preview")
```

Read [IFramePreviewBasicProps](src/components/basic/IFramePreviewBasic.tsx) jsdocs for config details.

### Customize display texts

Create a wrapper component, and provide `DisplayTextsContext`:

```tsx
import React from 'react';
import {
  defaultDisplayTexts,
  DisplayTexts,
  DisplayTextsContext,
  IFramePreview,
  IFramePreviewProps,
} from '@nrk/sanity-plugin-nrkno-iframe-preview';

const texts: DisplayTexts = {
  ...defaultDisplayTexts,
  iframeTitle: 'Changed preview title',
};

export function TranslatedIFramePreview(props: IFramePreviewProps) {
  return (
    <DisplayTextsContext.Provider value={texts}>
      <IFramePreview {...props} />
    </DisplayTextsContext.Provider>
  );
}
```

### Define preview component from schema
To enable iframe preview directly in the schema definition, we can do something along the lines of this:

Assume sanity.json with parts structure implemented like so
```json
{
  "name": "part:@sanity/desk-tool/structure",
  "path": "./structure.ts"
}
```

```ts
// someSchema.tsx
export const someSchema = {
  type: 'document',
  title: 'Some doc',
  livePreviewComponent: IFramePreview,
  fields: [/** omitted */]
}

// structure.ts
export function editAndPreviewViews<T>(previewComponent: PreviewComponent<T>) {
  return [
    S.view.form().title("Edit").icon(EditIcon),
    S.view
      .component(previewComponent)
      .icon(EyeIcon)
      .id("preview")
      .title("Preview"),
  ];
}

// https://www.sanity.io/docs/structure-builder-reference#97e44ce262c9
export const getDefaultDocumentNode = ({ schemaType }: any) => {
  const matchingTypes = S.documentTypeListItems()
    .filter((listItem: any) => listItem.spec.schemaType.name === schemaType)
    .map((listItem: any) => {
      const previewComponent = listItem.spec.schemaType.livePreviewComponent;
      if (previewComponent) {
        return S.document().views(editAndPreviewViews(previewComponent));
      }
      return S.document();
    });
  return matchingTypes.length ? matchingTypes[0] : S.document();
};

export default () => S.list().items(/* your structure */)
```

*Caveat*: uses access to protected `listItem.spec` field; this might break in future Sanity releases.

## Sequence diagram for dataflow

![sequence.png](docs/images/sequence.png)
_Figure 2: Sequence diagram for dataflow between Sanity Studio and the iframe_

## Develop

### Build
`npm run build`

### Test

In this directory

```bash
npm run build
npm link
```

```bash
cd /path/to/my-studio
npm link @nrk/sanity-plugin-nrkno-iframe-preview
```

Note: after running npm link, tests will start failing because of the way
React versions are handles during symlinking. Run `npm run init` from root directory to fix.

# Develop

This plugin is built with [sanipack](https://www.npmjs.com/package/sanipack).


