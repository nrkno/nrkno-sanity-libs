---
to: packages/<%= package %>/jest.config.js
---
const pkg = require('./package.json');
const base = require('../../jest.config.base.js');

module.exports = {
  ...base,
  name: pkg.name,
  displayName: pkg.name,
  testEnvironment: 'jsdom',
};
