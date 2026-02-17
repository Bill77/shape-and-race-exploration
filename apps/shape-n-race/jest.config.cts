const nextJest = require('next/jest.js');

const createJestConfig = nextJest({
  dir: './',
});

const config = {
  displayName: '@bill-org/shape-n-race',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/shape-n-race',
  testEnvironment: 'jsdom',
};

module.exports = createJestConfig(config);
