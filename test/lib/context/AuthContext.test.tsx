// test/lib/context/AuthContext.test.tsx
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../../src/lib/context/AuthContext';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../../../src/lib/firebase/firebaseConfig';

// Mock Firebase auth
jest.mock('../../../src/lib/firebase/firebaseConfig', () => ({
  auth: jest.fn()
}));

jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: jest.fn(() => ({})),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn()
}));

// Test component to access auth context
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <button data-testid="google-login" onClick={auth.login}>Login</button>
      <button onClick={auth.logout}>Logout</button>
      <button data-testid="email-login" onClick={() => auth.loginWithEmail('test@example.com', 'Password123!')}>
        Email Login
      </button>
      <button onClick={() => auth.signUpWithEmail('test@example.com', 'Password123!')}>
        Email Signup
      </button>
      <button data-testid="weak-signup" onClick={() => auth.signUpWithEmail('test@example.com', 'weak')}>
        Weak Password Signup
      </button>
      <div data-testid="loading">{auth.loading.toString()}</div>
      <div data-testid="user">{auth.user ? 'logged-in' : 'logged-out'}</div>
    </div>
  );
};

describe('AuthContext', () => {
  let mockAuthStateChanged: jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthStateChanged = onAuthStateChanged as jest.Mock;
    mockAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null);
      return jest.fn();
    });
  });

  it('provides initial loading state and null user', async () => {
    let authStateCallback: (user: any) => void;
    mockAuthStateChanged.mockImplementation((auth, callback) => {
      authStateCallback = callback;
      return jest.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    
    await act(async () => {
      authStateCallback(null);
    });

    expect(screen.getByTestId('user')).toHaveTextContent('logged-out');
  });

  it('handles Google login success', async () => {
    const mockUser = { email: 'test@example.com' };
    (signInWithPopup as jest.Mock).mockResolvedValueOnce({ user: mockUser });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByTestId('google-login');
    await act(async () => {
      await userEvent.click(loginButton);
    });

    expect(signInWithPopup).toHaveBeenCalled();
    expect(GoogleAuthProvider).toHaveBeenCalled();
  });

  it('handles Google login failure', async () => {
    const mockError = new Error('Login failed');
    (signInWithPopup as jest.Mock).mockRejectedValueOnce(mockError);
  
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
  
    const loginButton = screen.getByTestId('google-login');
    
    await act(async () => {
      const loginPromise = userEvent.click(loginButton);
      await expect(loginPromise).rejects.toThrow('Login failed');
    });
  });

  it('handles email signup with valid password', async () => {
    const mockUser = { email: 'test@example.com' };
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({ user: mockUser });
    (sendEmailVerification as jest.Mock).mockResolvedValueOnce();
    (signOut as jest.Mock).mockResolvedValueOnce();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signupButton = screen.getByText('Email Signup');
    await act(async () => {
      await userEvent.click(signupButton);
    });

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      auth,
      'test@example.com',
      'Password123!'
    );
    expect(sendEmailVerification).toHaveBeenCalled();
    expect(signOut).toHaveBeenCalled();
  });

  it('handles email signup with invalid password', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
  
    const weakSignupButton = screen.getByTestId('weak-signup');
    
    await act(async () => {
      const signupPromise = userEvent.click(weakSignupButton);
      await expect(signupPromise).rejects.toThrow('Password must be at least 8 characters long');
    });
  });

  it('handles email login with verified email', async () => {
    const mockUser = { email: 'test@example.com', emailVerified: true };
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({ 
      user: mockUser 
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByTestId('email-login');
    await act(async () => {
      await userEvent.click(loginButton);
    });

    expect(signInWithEmailAndPassword).toHaveBeenCalled();
  });


    it('handles email login with unverified email', async () => {
        const mockUser = { email: 'test@example.com', emailVerified: false };
        (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({ 
        user: mockUser 
        });
        (signOut as jest.Mock).mockResolvedValueOnce();
    
        render(
        <AuthProvider>
            <TestComponent />
        </AuthProvider>
    );

    const loginButton = screen.getByTestId('email-login');
  
    await act(async () => {
      const loginPromise = userEvent.click(loginButton);
      await expect(loginPromise).rejects.toThrow('Please verify your email');
    });
    })


  it('handles logout', async () => {
    (signOut as jest.Mock).mockResolvedValueOnce();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const logoutButton = screen.getByText('Logout');
    await act(async () => {
      await userEvent.click(logoutButton);
    });

    expect(signOut).toHaveBeenCalledWith(auth);
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');
    
    consoleSpy.mockRestore();
  });

  it('handles auth state changes', async () => {
    let authStateCallback: (user: any) => void;
    mockAuthStateChanged.mockImplementation((auth, callback) => {
      authStateCallback = callback;
      return jest.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('logged-out');

    await act(async () => {
      authStateCallback({ email: 'test@example.com' });
    });

    expect(screen.getByTestId('user')).toHaveTextContent('logged-in');

    await act(async () => {
      authStateCallback(null);
    });

    expect(screen.getByTestId('user')).toHaveTextContent('logged-out');
  });
});