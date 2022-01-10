---
to: packages/<%= package %>/tsconfig.build.json
---
{
  "extends": "./tsconfig.json",
  "exclude": [
    "build", "**/*.spec.ts", "**/*.test.ts", "node_modules"]
}
