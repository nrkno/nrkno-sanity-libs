---
to: packages/<%= package %>/tsconfig.json
---
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./build",
    "rootDir": "./src",
    "baseUrl": "./",
    "module": "commonjs",
    "target": "es6",
    "composite": true
  },
  "references": [],
  "include": ["src"],
  "exclude": ["build", "node_modules"]
}
