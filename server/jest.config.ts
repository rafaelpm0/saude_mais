module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    rootDir: '.',
    testMatch: ['**/test/**/*.e2e-spec.ts', '**/?(*.)+(spec|test).[tj]s?(x)'],
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig.json',
      },
    },
    moduleNameMapper: {
      '^src/(.*)$': '<rootDir>/src/$1',
    },
  };