import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './src',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  clearMocks: true,

  transformIgnorePatterns: [
    '/node_modules/(?!(uuid)/)', // force Jest to transform ESM uuid
  ],

  // Optional but helps with future ESM-compatible libs
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: 'tsconfig.json',
    },
  },
}

export default config
