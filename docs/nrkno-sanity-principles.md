# Principles of nrkno-sanity

_Disclaimer:_ This document assumes that you are familliar with the basics of [Sanity Studio](https://www.sanity.io/docs/sanity-studio), 
starting with [document schema](https://www.sanity.io/docs/document-type).

## Background
Sanity is used to author specialized content for [nrk.no](https://www.nrk.no) and underlying pages.  

Sanity was chosen after a public tender:

"The headless CMS will be used for producing content that does not fit already established content 
templates and workflows – as a supplement to the CMSs currently in use; Polopoly and WordPress. 
Polopoly has been the main CMS in NRK since 2005, but WordPress are also used for numerous sites.
Polopoly and WordPress are used for publishing articles, messages and pages across nrk.no and p3.no.

NRK often create tailor-made pages for special events and publish articles with custom formats and experimental 
features. To accommodate this, NRK is looking for a CMS that enables developers and journalists to focus on 
creating the best possible user experience for the audience, 
whilst allowing them to iterate on the underlying content model."

The documents from the tender are public, and can be accessed at [mercell.com](https://www.mercell.com/en/tender/129972526/nrk-ma3328-20e---cms-for-spesialproduksjon---fase-1-ny-utlysning-tender.aspx).

[Chapter one of the tender regulations](https://www.mercell.com/m/file/GetFile.ashx?id=130119078&version=0)
describes in detail what NRK was looking for in a headless CMS.

### Team environment 

Sanity has multiple developers, across multiple teams, that contribute to the Studio.
Therefore, it is essential that codebase allows new schemas and features to be developed in parallel.

It is also important that new and existing features can be discovered by developers,
and that feature development follow some common design principles.

### Deployment

nrkno-sanity runs 4 environments: feature, stage, preprod and production. 
Feature and stage shares a dataset, preprod and prod each have their own.

Sanity Studio is containerized and deployed to kubernetes. 
Branches are deployed to a standalone feature environment (dataset shared with stage).

Schemas and features can be feature-toggled based on environment or user-role, using options.

The sanity js-bundle is preprocessed as part of the build process to enable per-environment customizations and
partial english to norwegian translation of studio strings.

Each deployment is served from a dedicated backend that provide a slew of supporting APIs used by the studio. 
This allows nrkno to have build-time as well as runtime configuration in the Studio..

### Goals

Most features in the studio should be:

* Reusable
* Composable
* Discoverable
* Documented
* Typesafe
* Optimize for deletion
* Avoid merge-conflicts between unrelated features

These can all be solved by [option driven design](../packages/sanity-plugin-nrkno-odd-utils/docs/option-driven-design.md).

## Implementing Option Driven Design

NRK identified some areas of the Studio that could be improved to better serve the above goals. They where:

* Frequent merge conflicts in the array passed to createSchema.
* Complicated StructureBuilder-api, which made content organization in the Studio prone to merge conflicts.
* Duplicated StructureBuilder-code to enable previews for schemas.
* InputComponent-usage for custom features did not scale: components where not easily composable or discoverable.
* Custom document-action, badges and structure for a schema-type required edits in multiple files. 
This was counter to "optimize for deletion", and made it hard to know how a schema worked at-a-glance.
* Schema creation provided no type-inference. It was too easy to make typos, slowing down development.
* Studio features where be hard to discover, and developers had to carefully study the documentation to know what is possible.

These have all been addressed using option driven design.

To get there, nrkno-sanity relies heavily on some key Sanity parts (in sanity.json) and libraries found
in this repo and additional unpublished code.

### Key extensions

NRK has implemented these libs and patterns to tackle the above:

* [Typesafe schemas](../packages/nrkno-sanity-typesafe-schemas/README.md) - 
underpins everything: typesafety and autocompletion brings feature discovery and through it option driven design. 
All other features are integrated into the schema helpers using declaration merging. 
* [Option driven design utils](../packages/sanity-plugin-nrkno-odd-utils) -
primarily a guiding principle for create custom components in the Studio that reuses built-in Studio features as much as possible. 
* [Structure via options](../packages/sanity-plugin-nrkno-schema-structure) - Abstraction over StructureBuilder to allow schemas to define structure-configuration via options in an isolated manner.
* **all-schemas.ts** - a code-organization-pattern to reduce merge-conflicts in createSchema. Described below.
* **Schema instrumentation** - preprossess schema-definitions before passing them to createSchema. This way schemas can be augmented with
additional fields ect based on options. Described below.
* **Iframe preview with data from the studio** - enabled and configured using options, much like inputComponent or diffComponent. 
Queries are provided by the iframe, and executed by the studio. Fits well with the micro-frontend architecture at NRK,
where very render app can use a different framework or backend.
* **Option driven document-actions and badges**: use options instead of type-name to configure these. Described below. 

## Important parts

### Create schema
nrkno-sanity uses an all-schemas.ts file where all schemas in the studio are re-exported.
This significantly reduces merge-conflicts when developers merge new schemas.

At the time of writing, nrkno-sanity had ~300 schemas passed to createSchema.

Each feature should export all schemas from a single file, which then is re-exported in all-schemas.ts
```ts
//features/feature1/schemas.ts
export * from './child-schema'
export * from './child-schema2'
export const feature1Schema = schema(/* omitted */)
```

Note that the re-exports happening here should try to only export sanity-schema definitions.
Extra care must be taken when exporting fields (for reuse), since these should not end up in createSchema.
(and the json-structure is essentially indistinguishable from schemas, but with name having a completely different usage).
Therefore, it is recommended to put reusable fields should go in a separate file.

```ts
//all-schemas.ts
export * from '../features/feature1/schemas';
export * from '../features/feature2/schemas';
export * as feature3 from '../features/feature3/schemas';
```

```ts
//create-schema.ts
import createSchema from 'part:@sanity/base/schema-creator';
import schemaTypes from 'all:part:@sanity/base/schema-type';
import * as allTypes from './all-schemas';
import { getSyncConfig } from '../client-config';
import { IStudioEnvironment } from '../../common/config-types';
import { augmentSchema } from './augment-schemas';

const env = getSyncConfig().environment;

const schemas = Object.values(allTypes)
    // support for export * as someFeature './feature/all-schemas-in-the-feature'
    .map((m: any) => {
        if (m.__esModule === true) {
            return Object.values(m);
        }
        return m;
    })
    .flatMap((type: any) => type)
    .filter((type: any) => type && type.type && type.name)
    // remove all document-schemas not enabled in the environment
    .filter(
        (type: any) =>
            !type.options?.enabledEnvironments ||
            type.type !== 'document' ||
            (type.options?.enabledEnvironments as IStudioEnvironment[])?.includes(env)
    )
    // add cross-cutting stuff based on schema-options, like adding new fields ect
    .map(augmentSchema);

export default createSchema({
    name: 'default',
    types: [...schemaTypes, ...schemas],
});
```

Sanity.json -> parts:
```json
    {
      "name": "part:@sanity/base/schema",
      "path": "./src/schemas/create-schema.ts"
    }
```

### Input resolver

```ts
// input-resolver.ts with most option->component mappings omitted for brevity 
export default function resolveInput<
  T extends SchemaType & { inputComponent?: any; options?: any }
>(type: T) {
  const options: IAllExtensionOptions | undefined = type.options;
  const inputComponent = type.inputComponent;
  
  if (options.resolveInputComponentFirst && inputComponent) {
    return inputComponent;
  }
  
  if (options.showTextCount?.words || options.showTextCount?.chars) {
    return TextWithCount;
  }
  if (options.hideTitle) {
    return HideTitle;
  }
  if (options.hideObjectNesting) {
    return ObjectNesting;
  }

  if (options.showCount) {
      return ArrayWithCount;
  }
  if (options.pageSize) {
      return PaginatedArrayInput;
  }
  if (useDecoratedArray(options, type)) {
    return DecoratedArrayInput;
  }
}
```

```json
{
  "implements": "part:@sanity/form-builder/input-resolver",
  "path": "./src/input-resolver.ts"
}
```

All options are added to [typesafe schemas](../packages/nrkno-sanity-typesafe-schemas/README.md) via declaration merging.
Nrkno-sanity also maintains a IAllExtensionOptions union type that contains ALL options for all schema types, 
specifically to have typesafety in input-resolver.ts.

### Structure

nrkno-sanity uses [nrkno-schema-structure](../packages/sanity-plugin-nrkno-schema-structure) which makes building the Sanity structure easier.

All documents with `customStructure` are put in a directory-like data-structure,
which can be mapped to StructureBuilder code.

The outermost Structure is then manually composed using this directory-structure based on group-names.

```json
  {
  "name": "part:@sanity/base/new-document-structure",
  "path": "./src/structure/new-document-structure.ts"
}
```

```json
{
"name": "part:@sanity/desk-tool/structure",
"path": "./src/structure/structure.ts"
}
```

### Document actions

```ts
export default function resolveDocumentActions(props: DocumentActionProps) {
  let actions = [...defaultResolve(props)];
  if (smartimportEnabled(props.type)) {
    actions.push(SmartimportAction);
  }

  actions = actions.map((Action: any) =>
    // Replace default actionButton with one that changes color & title when a document has warnings
    Action === PublishAction ? PublishWarningAction : Action
  );

  return actions;
}

export function smartimportEnabled(type: string) {
    // find schema based on schema-type, so we can retrieve options
    const schema: DocumentSchema = schemaRegistry.get(type);
    return schema?.options?.smartimport;
}

```

```json
    {
      "implements": "part:@sanity/base/document-actions/resolver",
      "path": "./src/resolve-document-actions.ts"
    }
```

Document badges are handled similarly.

### Example nrkno-sanity schema

Showcase of typesafe-schemas as well as some options alluded to above. 

```ts
const quizType = 'quiz' as const;

export interface Quiz {
  _type: typeof type;
  title?: string;
  image?: Image;
  questions?: Question[];
}

export const quiz = schema('document', {
    name: quizType,
    title: 'Quiz',
    icon: QuizIcon,
    // places under a Quiz document list in a Quiz-directory (eg. Quiz/Quiz in the structure) 
    customStructure: {
      type: 'document-list',
      group: 'quiz',
      enabledEnvironments: ['feature', 'stage'],
      enabledForRoles: ['developer'],
    },
    options: {
        // configures slit pane preview for the doucment type in structure. Builds on top of customStructure.views functionality
        livePreviewComponent: QuizPreview,
        
        // this will add a language feield to the schema before passing it to create-schema
        // the field comes with a document-wide spellcheck button for the selected language
        spellcheck: true,
        
        // this will add a hidden field to the schema before passing it to create-schema
        // and append a document badge & document-action
        smartimport: true,
    },
    fields: [
        field('string', {
            name: 'title',
            title: 'Title - visible to the public',
        }),
        field('nrk-image', {
            name: 'image',
            title: 'Image',
            options: {
                crops: {
                    '1:1': [300, 600, 1000],
                },
            },
        }),
        field('array', {
            name: 'questions',
            title: 'Questions',
            of: [ arrayOf('', { type: quizQuestion.name })],
            options: {
                // nrk-spesific options for arrays
                // each of these has a seperate entry in input-resolver,
                // and effectivly results in a automatically composed inputComponent
                // equivialent to ShowCount(ShowIndex(NrkArray(InlineItem, ArrayItemActions)))
                editModal: 'inline',
                showCount: true,
                showIndex: true,
                arrayItemActions: createArrayitemActions(),
            },
        }),
    ],
    preview: quizPreview,
});

checkSchema(forType<Quiz>(), quiz);
```


