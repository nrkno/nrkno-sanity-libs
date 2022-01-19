const pkg = require('./package.json');
const base = require('../../jest.config.base.js');

module.exports = {
  ...base,
  name: pkg.name,
  displayName: pkg.name,
  testEnvironment: 'node',
  moduleNameMapper: {
    '^part:@sanity/base/edit-icon$': '<rootDir>/mocks/editIcon.js',
    '^part:@sanity/base/user$': '<rootDir>/mocks/user.js',
    '^part:@sanity/base/schema$': '<rootDir>/mocks/schema.js',
    '^part:@sanity/base/client$': '<rootDir>/mocks/client.js',
    '^part:@sanity/desk-tool/structure\\??$': '<rootDir>/mocks/userStructure.js',
    '^part:@sanity/data-aspects/resolver$': '<rootDir>/mocks/dataAspects.js',
    '^part:@sanity/base/util/document-action-utils': '<rootDir>/mocks/documentActionUtils.js',
  },
};
