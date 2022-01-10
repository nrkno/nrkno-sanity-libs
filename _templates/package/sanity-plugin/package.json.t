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
    "plugin-types"
  ],
  "scripts": {
    "build": "tsc --project tsconfig.build.json && sanipack build",
    "watch": "sanipack build --watch",
    "clean": "cross-env rimraf build *.tsbuildinfo",
    "test": "cross-env NODE_ENV=test jest",
    "prepublishOnly": "npm run clean && npm run build && sanipack verify"
  },
  "devDependencies": {
    "cross-env": "^7.0.3",
    "rimraf": "^3.0.2",
    "sanipack": "^2.1.0",
    "typescript": "^4.5.4"
  }
}
