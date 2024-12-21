// src/lib/context/LoginModalContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { X } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Login from '../../components/auth/Login';

interface LoginModalContextType {
  isOpen: boolean;
  showLoginModal: () => void;
  hideLoginModal: () => void;
}

interface LoginModalProviderProps {
  children: ReactNode;
}

const LoginModalContext = createContext<LoginModalContextType | null>(null);

export function LoginModalProvider({ children }: LoginModalProviderProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const showLoginModal = () => setIsOpen(true);
  const hideLoginModal = () => setIsOpen(false);

  const value: LoginModalContextType = {
    isOpen,
    showLoginModal,
    hideLoginModal
  };

  return (
    <LoginModalContext.Provider value={value}>
      {children}
      <Modal isOpen={isOpen} onClose={hideLoginModal}>
        <div className="p-6 bg-white rounded-lg max-w-md w-full mx-auto relative">
          <button
            onClick={hideLoginModal}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close login form"
          >
            <X size={20} className="text-gray-500" />
          </button>

          <h2 className="text-2xl font-bold mb-6 text-center">
            Login Required
          </h2>
          
          <p className="text-gray-600 mb-6 text-center">
            Please login to continue
          </p>

          <Login onSuccessfulLogin={hideLoginModal} />
        </div>
      </Modal>
    </LoginModalContext.Provider>
  );
}

export function useLoginModal(): LoginModalContextType {
  const context = useContext(LoginModalContext);
  if (!context) {
    throw new Error('useLoginModal must be used within a LoginModalProvider');
  }
  return context;
}
