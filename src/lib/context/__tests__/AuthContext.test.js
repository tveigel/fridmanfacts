// src/lib/context/__tests__/AuthContext.test.js
import React from 'react';
import { render, act, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { auth } from '../../firebase/firebaseConfig';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

// Mock Firebase modules
jest.mock('../../firebase/firebaseConfig', () => ({
  auth: {},
}));

jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: jest.fn(() => ({})),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  getAuth: jest.fn(),
}));

describe('AuthContext', () => {
  const mockUser = {
    uid: 'user1',
    email: 'test@example.com',
    getIdToken: jest.fn().mockResolvedValue('token123')
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default auth state listener
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null);
      return () => {};
    });
  });

  const wrapper = ({ children }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('should provide user state through context', async () => {
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return () => {};
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
  });

  it('should handle login successfully', async () => {
    signInWithPopup.mockResolvedValue({ user: mockUser });
    
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for initial auth state
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.login();
    });

    expect(signInWithPopup).toHaveBeenCalled();
    expect(GoogleAuthProvider).toHaveBeenCalled();
  });

  it('should handle logout successfully', async () => {
    signOut.mockResolvedValue();
    
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for initial auth state
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(signOut).toHaveBeenCalledWith(auth);
  });

  it('should handle login errors', async () => {
    const error = new Error('Login failed');
    signInWithPopup.mockRejectedValue(error);
    
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for initial auth state
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await expect(result.current.login()).rejects.toThrow('Login failed');
  });

  it('should cleanup auth listener on unmount', () => {
    const unsubscribe = jest.fn();
    onAuthStateChanged.mockReturnValue(unsubscribe);

    const { unmount } = render(
      <AuthProvider>
        <div>Test</div>
      </AuthProvider>
    );

    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});