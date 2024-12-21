// src/test/__mocks__/firebase/index.ts
export { mockAuth } from './auth';
export { mockFirestore, mockTimestamp } from './firestore';

// Mock the actual Firebase config
jest.mock('@/lib/firebase/firebaseConfig', () => ({
  auth: mockAuth,
  db: mockFirestore,
}));