// src/test/__mocks__/firebase/auth.ts
import { User } from 'firebase/auth';

export const mockUser: Partial<User> = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  getIdTokenResult: jest.fn().mockResolvedValue({
    claims: { moderator: false, admin: false }
  }),
};

export const mockAuth = {
  currentUser: mockUser,
  onAuthStateChanged: jest.fn((callback) => {
    callback(mockUser);
    return jest.fn(); // unsubscribe function
  }),
  signInWithPopup: jest.fn().mockResolvedValue({ user: mockUser }),
  signOut: jest.fn().mockResolvedValue(undefined),
  createUserWithEmailAndPassword: jest.fn().mockResolvedValue({ user: mockUser }),
  signInWithEmailAndPassword: jest.fn().mockResolvedValue({ user: mockUser }),
  sendEmailVerification: jest.fn().mockResolvedValue(undefined),
};
