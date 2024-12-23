import type { Config } from 'jest'
import nextJest from 'next/jest'




const createJestConfig = nextJest({

  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/test/setupTests.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    '^@/styles/(.*)$': '<rootDir>/src/styles/$1',
    // Handle CSS imports (with CSS modules)
    '\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    // Handle CSS imports (without CSS modules)
    '\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
    // Handle image imports
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
  },
  
  testMatch: [
    "<rootDir>/test/**/*.{js,jsx,ts,tsx}"
  ],
  
  coverageDirectory: "<rootDir>/coverage",
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.{js,ts}",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    "!src/styles/**/*"
  ],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  rootDir: '.',
  testTimeout: 10000,
  verbose: true,
}

module.exports = createJestConfig(customJestConfig)