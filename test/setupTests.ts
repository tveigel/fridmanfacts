import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

// Set up DOM environment mocks
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock window.fs API (required for file operations in tests)
global.window = {
  ...global.window,
  fs: {
    readFile: jest.fn().mockImplementation(() => Promise.resolve(new Uint8Array())),
  },
};

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock environment variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_FIREBASE_API_KEY: 'mock-api-key',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'mock-auth-domain',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'mock-project-id',
  NODE_ENV: 'test'
};

// Suppress specific console methods during tests
const originalConsole = { ...console };
console.error = jest.fn((...args) => {
  if (args[0]?.includes?.('Warning:')) return;
  originalConsole.error(...args);
});

console.warn = jest.fn((...args) => {
  if (args[0]?.includes?.('Warning:')) return;
  originalConsole.warn(...args);
});