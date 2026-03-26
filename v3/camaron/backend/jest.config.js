/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/scripts/**'],
  coverageDirectory: 'coverage',
  testTimeout: 30000,
  setupFilesAfterFramework: [],
};
