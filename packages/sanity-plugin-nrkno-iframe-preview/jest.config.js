const pkg = require('./package.json');
const base = require('../../jest.config.base.js');

module.exports = {
  ...base,
  name: pkg.name,
  displayName: pkg.name,
  testEnvironment: 'jsdom',
  // ignore stuff that breaks jest when importing
  moduleNameMapper: {
    'part:@sanity/base/client': '<rootDir>/mocks/dummy-import.js',
    '\\.css$': '<rootDir>/mocks/dummy-import.js',
  },
};
