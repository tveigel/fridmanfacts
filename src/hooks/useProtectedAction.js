// src/hooks/useProtectedAction.js
import { useAuth } from '../lib/context/AuthContext';
import { useLoginModal } from '../lib/context/LoginModalContext';

export function useProtectedAction() {
  const { user } = useAuth();
  const { showLoginModal } = useLoginModal();

  const withAuth = (action) => (...args) => {
    if (!user) {
      showLoginModal();
      return;
    }
    return action(...args);
  };

  return { withAuth };
}