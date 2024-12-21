import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { LoginModalProvider } from '../lib/context/LoginModalContext';
import { AuthProvider } from '../lib/context/AuthContext';
import { NotificationsProvider } from '../lib/context/NotificationsContext';
import { FactCheckSettingsProvider } from '../lib/context/FactCheckSettingsContext';

// Keep your existing mockProviderProps
export const mockProviderProps = {
  mockUser: null,
  mockNotifications: [],
  mockSettings: {
    showValidatedTrue: true,
    showValidatedFalse: true,
    showValidatedControversial: true,
    showUnvalidated: true,
    minNetVotes: -999,
    moderatorOnly: false,
  }
};

// Mock user data
const defaultMockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  getIdTokenResult: jest.fn().mockResolvedValue({
    claims: { moderator: false, admin: false }
  })
};

// Your existing AllTheProviders wrapper is good!
export const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <LoginModalProvider>
        <NotificationsProvider>
          <FactCheckSettingsProvider>
            {children}
          </FactCheckSettingsProvider>
        </NotificationsProvider>
      </LoginModalProvider>
    </AuthProvider>
  );
};

// Enhanced custom render with better typing
function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    preloadedState?: Record<string, unknown>;
    route?: string;
  }
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Mock auth state
export const mockAuthenticatedUser = (userData = {}) => {
  const mockUser = {
    ...defaultMockUser,
    ...userData
  };
  
  // Use jest.spyOn on the AuthContext instead of Firebase directly
  jest.spyOn(AuthProvider.prototype, 'useAuth').mockImplementation(() => ({
    user: mockUser,
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
    loginWithEmail: jest.fn(),
    signUpWithEmail: jest.fn()
  }));
  
  return mockUser;
};

// Clear auth mock
export const clearAuthMock = () => {
  jest.spyOn(AuthProvider.prototype, 'useAuth').mockImplementation(() => ({
    user: null,
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
    loginWithEmail: jest.fn(),
    signUpWithEmail: jest.fn()
  }));
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Add some utility functions for common testing scenarios
export const waitForLoadingToFinish = () => 
  new Promise((resolve) => setTimeout(resolve, 0));

export const createMockFactCheck = (overrides = {}) => ({
  id: 'test-fact-check-id',
  episodeId: 'test-episode-id',
  transcriptTime: '00:00:00',
  flaggedText: 'Test flagged text',
  submittedBy: 'test-user-id',
  status: 'UNVALIDATED',
  upvotes: 0,
  downvotes: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});