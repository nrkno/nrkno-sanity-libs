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
* install all package dependencies, then build everything.
* prepare husky commit hooks required for development.

Rerun `npm run init` after package dependencies have change, to install & build everything.

## About devDependencies

Put all devDependencies in root package.json. They will still be found by npm through 
recursive resolution, and will force all packages to use the same versions.
In other words: do not put devDependencies in package.json of each package.

Only packages with dependencies or devDependencies will generate package-lock.json in the package.
peerDependencies alone will not.  

This is an alternative approach to [lerna bootstrap --hoist](https://github.com/lerna/lerna/blob/main/doc/hoist.md#lerna-hoisting),
and gives faster build times for packages with mostly peerDependencies (the case for sanity-plugins).

This also gives us the added benefit of not having to maintain devDependencies in _templates.

## Tests

`npm run test`

To test a package in another project, use npm link/yarn link.

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

