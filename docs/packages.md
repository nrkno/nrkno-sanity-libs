# Hygen templates
## Create a new package

This repo uses [Hygen templates](http://www.hygen.io/docs/templates) to simplify package creation. 

### Sanity plugin
> npm run package:sanity-plugin

This will:
* prompt for package name
* create a new package unded /packages based on _templates/package/sanity-plugin template
* update `tsconfig.project.json` to include the new package
* invoke `npm install` which will build an link everything

The references array in `tsconfig.project.json`  must list subprojects in the required build order.
Eg. if package2 depends on package1, package1 must be first in the array.

### Other library 

> npm run package:lib

Will do the same as sanity plugin, but uses _templates/package/ts

### Dev dependencies

Lerna makes devDependencies listed in the top-level package.json available to all packages.
However, packages must still list their own devDependencies in the local package.json.

#### Things to keep in mind

- depending on other packages in this repository:
  - add it as a dependency in package.json using current version number
  - add it to references in tsconfig.json.
    ```json {
    "references": [{ "path": "../nrkno-sanity-odd-utils/tsconfig.build.json" }]
    }
    ```
- `tsconfig.json` is used by IDE & jest, `tsconfig.build.json` is used for compiling to /build

## Bumping from 0.x.x to 1.0.0

For 0.x.x version, fix & feat only bumps patch, while BREAKING CHANGE bumps minor.
As a workaround we have to commit 1.0.0 to package.json (and update dependencies using the package) as a fix.

This will result in CI publishing 1.0.1.

# Working with the package template

New packages are created using [Hygen templates](http://www.hygen.io/docs/templates),
located in `_templates/package`.
