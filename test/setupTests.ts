import '@testing-library/jest-dom';
import util from 'util';

// Explicitly type the TextEncoder and TextDecoder
const customTextEncoder = util.TextEncoder as unknown as typeof global.TextEncoder;
const customTextDecoder = util.TextDecoder as unknown as typeof global.TextDecoder;

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = customTextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = customTextDecoder;
}

// Mock window.fs API
Object.defineProperty(global, 'window', {
  value: {
    fs: {
      readFile: jest.fn().mockImplementation(() => Promise.resolve(new Uint8Array())),
    },
  },
  writable: true,
});

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