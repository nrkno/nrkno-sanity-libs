---
to: packages/<%= package %>/tsconfig.json
---
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./build",
    "rootDir": "./src",
    "baseUrl": "./",
    "module": "<%= module %>",
    "target": "<%= target %>",
    "composite": true
  },
  "references": [],
  "include": ["src"],
  "exclude": ["build", "node_modules"]
}
