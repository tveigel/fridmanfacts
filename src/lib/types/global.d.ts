// src/lib/types/global.d.ts
import { User } from 'firebase/auth';

declare global {
  // Existing window interface
  interface Window {
    fs: {
      readFile: (path: string, options?: { encoding?: string }) => Promise<Uint8Array | string>;
    };
  }

  // Add these new declarations
  var TextEncoder: typeof globalThis.TextEncoder;
  var TextDecoder: typeof globalThis.TextDecoder;

  // For tests
  namespace NodeJS {
    interface Global {
      TextEncoder: typeof globalThis.TextEncoder;
      TextDecoder: typeof globalThis.TextDecoder;
      window: Window & {
        fs: {
          readFile: jest.Mock;
        };
      };
    }
  }
}

export {};