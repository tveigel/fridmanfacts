// src/lib/types/global.d.ts
import { User } from 'firebase/auth';

declare global {
  interface Window {
    fs: {
      readFile: (path: string, options?: { encoding?: string }) => Promise<Uint8Array | string>;
    };
  }
}

export {};