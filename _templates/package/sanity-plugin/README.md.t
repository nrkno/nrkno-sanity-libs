---
to: packages/<%= package %>/README.md
---
# @nrk/<%= package %>

Sanity plugin for Sanity Content Studio

Type: <%= packageType %>

# Installation

## Yarn

In Sanity studio project run:

`npx sanity install @nrk/<%= package %>`

This will run yarn install & add the plugin to sanity.json plugin array.

## npm

`npm install --save @nrk/<%= package %>`

Add "@nrk/<%= package %>" to "plugins" in `sanity.json` manually.

# Usage

A bit about how to use the plugin.

# Develop

This plugin is built with [sanipack](https://www.npmjs.com/package/sanipack).
