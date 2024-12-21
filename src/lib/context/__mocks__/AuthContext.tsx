import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { getAuth } from 'firebase/auth';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    onAuthStateChanged: jest.fn((callback) => {
      callback(null);
      return jest.fn(); // Return mock unsubscribe function
    }),
  })),
  GoogleAuthProvider: jest.fn(() => ({})),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
}));

describe('AuthContext', () => {
  it('provides auth context value', async () => {
    const TestComponent = () => {
      const auth = useAuth();
      return <div>{auth.user ? 'Logged in' : 'Not logged in'}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Not logged in')).toBeInTheDocument();
  });
});