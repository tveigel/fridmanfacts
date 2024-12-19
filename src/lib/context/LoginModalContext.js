"use client";

import React, { createContext, useContext, useState } from 'react';
import { X } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Login from '../../components/auth/Login';

const LoginModalContext = createContext(null);

export function LoginModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const showLoginModal = () => setIsOpen(true);
  const hideLoginModal = () => setIsOpen(false);

  return (
    <LoginModalContext.Provider value={{ showLoginModal, hideLoginModal }}>
      {children}
      <Modal isOpen={isOpen} onClose={hideLoginModal}>
        <div className="p-6 bg-white rounded-lg max-w-md w-full mx-auto relative">
          {/* Close Button */}
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

export function useLoginModal() {
  const context = useContext(LoginModalContext);
  if (context === null) {
    throw new Error('useLoginModal must be used within a LoginModalProvider');
  }
  return context;
}