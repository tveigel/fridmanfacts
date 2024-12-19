// src/components/auth/__tests__/Login.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../Login';
import { useAuth } from '../../../lib/context/AuthContext';

// Mock the useAuth hook
jest.mock('../../../lib/context/AuthContext');

describe('Login', () => {
  const mockLogin = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    // Clear mock calls between tests
    jest.clearAllMocks();
  });

  it('renders login button when user is not logged in', () => {
    useAuth.mockReturnValue({
      user: null,
      login: mockLogin,
      logout: mockLogout
    });

    render(<Login />);
    
    expect(screen.getByText('Login with Google')).toBeInTheDocument();
  });

  it('renders logout button when user is logged in', () => {
    useAuth.mockReturnValue({
      user: { displayName: 'Test User' },
      login: mockLogin,
      logout: mockLogout
    });

    render(<Login />);
    
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getByText('Welcome, Test User!')).toBeInTheDocument();
  });

  it('calls login function when login button is clicked', async () => {
    useAuth.mockReturnValue({
      user: null,
      login: mockLogin,
      logout: mockLogout
    });

    render(<Login />);
    
    fireEvent.click(screen.getByText('Login with Google'));
    
    expect(mockLogin).toHaveBeenCalled();
  });

  it('handles login error correctly', async () => {
    const mockLoginWithError = jest.fn().mockRejectedValue(new Error('Login failed'));
    
    useAuth.mockReturnValue({
      user: null,
      login: mockLoginWithError,
      logout: mockLogout
    });

    render(<Login />);
    
    fireEvent.click(screen.getByText('Login with Google'));
    
    await waitFor(() => {
      expect(screen.getByText('Failed to login. Please try again.')).toBeInTheDocument();
    });
  });
});