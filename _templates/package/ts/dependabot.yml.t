---
to: .github/dependabot.yml
inject: true
append: true
---
  - package-ecosystem: "npm"
    directory: "/packages/<%= package %>"
    schedule:
      interval: "daily"
    allow:
      - dependency-type: "production"
