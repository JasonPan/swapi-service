import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: ['.e2e-spec.ts', '.module.ts', 'main.ts', '.mock.ts'],
  testEnvironment: 'node',
  roots: ['<rootDir>/apps/', '<rootDir>/lib/'],
  modulePaths: ['<rootDir>'],
  moduleNameMapper: {
    '^lib/common(|/.*)$': '<rootDir>/lib/common/$1',
  },
};

export default config;
