"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface UsernameContextType {
  showWelcomeModal: boolean;
  setShowWelcomeModal: (show: boolean) => void;
  initialUsername: string;
  setInitialUsername: (username: string) => void;
}

const UsernameContext = createContext<UsernameContextType | null>(null);

export function UsernameProvider({ children }: { children: ReactNode }) {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [initialUsername, setInitialUsername] = useState('');

  return (
    <UsernameContext.Provider value={{
      showWelcomeModal,
      setShowWelcomeModal,
      initialUsername,
      setInitialUsername
    }}>
      {children}
    </UsernameContext.Provider>
  );
}

export function useUsername() {
  const context = useContext(UsernameContext);
  if (!context) {
    throw new Error('useUsername must be used within a UsernameProvider');
  }
  return context;
}