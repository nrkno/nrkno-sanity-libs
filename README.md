# NRK.no Sanity libraries

NRK.no Sanity libraries contains an assortment of plugins and libraries used by NRK.no to extend
Sanity Studio and apps using Sanity as a datasource.

[Principles of nrkno-sanity](docs/nrkno-sanity-principles.md) outlines a bit about how NRK.no has configured Sanity Studio
to optimize for a multi-team environment, all shipping content to distributed frontend.

Many of the libraries are based around the idea of [option driven design](packages/sanity-plugin-nrkno-odd-utils/docs/option-driven-design.md),
and everything relies on [typesafe-schemas](packages/nrkno-sanity-typesafe-schemas/README.md).

Please note that NRK is not looking for [contributions](./CONTRIBUTING.md) for this particular repo.

This monorepo uses Lerna for versioning & publishing to npm.
Publishing is triggered manually by the nrk.no team using CI infrastructure.

It is recommended to skim through the [Lerna documentation](https://github.com/lerna/lernaAj).
 
## Getting started
Run `npm install && npm run init`. 

This will:
* install all dependencies needed for Lerna.
* install and hoist all package dependencies, then build everything.
* prepare husky commit hooks required for development.

Rerun `npm run init` after package dependencies have change, to hoist & link everything correctly.

## Tests

`npm run test`

To test a package in another project, use npm link/yarn link.

## Upgrading minor Sanity dependencies

`npm run upgrade:sanity`

Script will upgrade (minor) Sanity dependencies in the root and all packages, install, hoist and link everything. 

## Commits & Versioning

All commits on master should follow
[convential commit format](https://www.conventionalcommits.org/en/v1.0.0/#summary):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

We use commitlint to enforce this with a git-hook.

### Examples
```
fix: allow provided config object to extend other configs
```

```
feat: allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used for extending other config files
```

### Determine release version for current branch

`npm run version:dry-run`

Approximate result:

> Changes:
>
> - @nrk/nrkno-lib-1: 0.4.0 => 0.4.1
> - @nrk/sanity-plugin-nrkno-lib-2 1.4.0 => 1.5.0
>
> ? Are you sure you want to create these versions? No

Note: A yes answer will modify package.json files & update CHANGELOG.md, but nothing will be commited or pushed.

## Publishing

Publishing is triggered by nrk.no team using CI infrastructure (nrkno-sanity-libs-releaser).

## Create a new package

See [packages documentation](docs/packages.md).

**Note:** Packages are _private_ on npm by default. 
Add 
```json
  "publishConfig": {
    "access": "public"
  }
```
to package.json to make it public on npm.
