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
    open-pull-requests-limit: 30
