// src/hooks/useProtectedAction.ts
import { useAuth } from '../lib/context/AuthContext';
import { useLoginModal } from '../lib/context/LoginModalContext';

type ActionFunction = (...args: any[]) => any;

interface UseProtectedAction {
  withAuth: <T extends ActionFunction>(action: T) => (...args: Parameters<T>) => ReturnType<T> | void;
}

export function useProtectedAction(): UseProtectedAction {
  const { user } = useAuth();
  const { showLoginModal } = useLoginModal();

  const withAuth = <T extends ActionFunction>(action: T) => 
    (...args: Parameters<T>): ReturnType<T> | void => {
      if (!user) {
        showLoginModal();
        return;
      }
      return action(...args);
    };

  return { withAuth };
}