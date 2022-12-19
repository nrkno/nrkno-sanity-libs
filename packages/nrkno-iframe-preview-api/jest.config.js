const pkg = require('./package.json');
const base = require('../../jest.config.base.js');

module.exports = {
  ...base,
  displayName: pkg.name,
};
