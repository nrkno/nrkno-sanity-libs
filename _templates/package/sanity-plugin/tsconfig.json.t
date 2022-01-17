---
to: packages/<%= package %>/tsconfig.json
---
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./build",
    "rootDir": "./src",
    "baseUrl": "./",
    "module": "esnext",
    "target": "esnext",
    "composite": true,
    "jsx": "react",
  },
  "references": [],
  "include": ["./src"],
  "exclude": ["build", "plugin-types", "node_modules"],
  "volta": {
    "node": "14.17.5",
    "npm": "6.14.14"
  }
}
