module.exports = {
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  preset: 'ts-jest',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testRegex: '(/src/.*.(test|spec)).(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  coveragePathIgnorePatterns: ['(tests/.*.mock).(jsx?|tsx?)$'],
  modulePathIgnorePatterns: ['<rootDir>/build/'],
  moduleDirectories: ['node_modules', __dirname],
};
