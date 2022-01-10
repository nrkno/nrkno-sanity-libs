# @nrk/sanity-plugin-nrkno-odd-utils

nrkno-odd-utils (odd = option driven design) contains a handful of utility functions and classes for working with
[Sanity custom components](https://www.sanity.io/docs/custom-input-widgets).

See docs about [option driven design](docs/option-driven-design.md) for more.

# Installation
In Sanity studio project run:

`npx sanity install @nrk/sanity-plugin-nrkno-odd-utils`

This will run yarn install & add the plugin to sanity.json plugin array.

# Usage

Easily decorate and reuse built-in Sanity inputs by delegating to NestedFormBuilder.
It is imperative that we unset the inputComponent in the type (or unset the option used by input-resolver.ts).

Functions available as module imports:

```ts
import {
    unsetOption, 
    unsetInputComponent,
    useUnsetOption, 
    useUnsetInputComponent, 
    NestedFormBuilder
} from '@nrk/sanity-plugin-nrkno-odd-utils'
```


## Example - inputComponent

Given a schema with an input component: 
```ts
const schemaOrField = {
  name: 'schemaOrField',
  inputComponent: CustomComponent,
}
```

We can decorate a custom heading over a standard sanity input (regardless of type), like so:

```tsx
// CustomComponent.tsx
import React, {forwardRef, Ref} from 'react';
import {useUnsetInputComponent, NestedFormBuilder} from '@nrk/sanity-plugin-nrkno-odd-utils';

export const CustomComponent = forwardRef(function CustomComponent(props, ref) {
    // IMPORTANT: leaving out will cause the browser to lock up in an infinite loop
    const type = useUnsetInputComponent(props.type);
    return <div>
        <h4>A custom heading</h4>
        <NestedFormBuilder {...props} ref={ref} type={type}/>
    </div>;
});
```

## Example - option

Given a schema with an option, and an input-resolver.js file defined in sanity.json:
```ts
// schema-file.js
const schemaOrField = {
  name: 'schemaOrField',
  option: {
      custom: true
  }
}

// input-resolver.js
function resolveInput(schema) {
    if(schema.options?.custom) {
        return CustomComponent
    }
}
```
We can decorate a custom heading over a standard sanity input (regardless of type), like so:

```tsx
// CustomComponent.tsx
import React, {forwardRef, Ref} from 'react';
import {useUnsetOption, NestedFormBuilder} from '@nrk/sanity-plugin-nrkno-odd-utils';

export const CustomComponent = forwardRef(function CustomComponent(props, ref) {
    // IMPORTANT: leaving out will cause the browser to lock up in an infinite loop
    const type = useUnsetOption(props.type, 'custom');
    return <div>
        <h4>A custom heading</h4>
        <NestedFormBuilder {...props} ref={ref} type={type}/>
    </div>;
});
```

### Unit testing components using NestedFormBuilder

NestedFormBuilder extends FormBuilderInput. FormBuilderInput is a Sanity component that uses
 non-standard import syntax that does not play well with Jest (`import x from 'part:xyz'`).

See [NestedFormBuilder.test.ts](src/lib/NestedFormBuilder.test.tsx) for examples on how to mock FormBuilderInput,
and check which props passed to FormBuilderInput during render. 

This is useful when unit-testing that props.type was modified correctly for instance. 

# Develop

This plugin is built with [https://www.npmjs.com/package/sanipack](sanipack).


## Test the build

Inside this directory run
```bash
npm run build 
yarn link
```

Then
```bash
cd /path/to/sanity-studio
yarn link @nrk/sanity-plugin-nrkno-odd-utils
```

The change to yarn is intentional , since that is what Sanity Studio uses.
