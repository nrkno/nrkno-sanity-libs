---
to: packages/<%= package %>/package.json
sh:  cd <%= cwd %> && node scripts/add-new-package.js <%= package %>
---
{
  "name": "@nrk/<%= package %>",
  "version": "0.0.1",
  "main": "./build/index.js",
  "types": "./plugin-types/index.d.ts",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/nrkno/nrkno-sanity-libs.git",
    "directory": "packages/<%= package %>"
  },
  "files": [
    "sanity.json",
    "build",
    "plugin-types",
    "src"
  ],
  "scripts": {
    "build": "tsc --project tsconfig.build.json && sanipack build && sanipack verify",
    "watch": "sanipack build --watch",
    "clean": "cross-env rimraf build *.tsbuildinfo",
    "test": "cross-env NODE_ENV=test jest"
  },
  "volta": {
    "node": "14.17.5",
    "npm": "6.14.14"
  }
}
