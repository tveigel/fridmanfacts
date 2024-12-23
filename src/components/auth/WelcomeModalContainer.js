// components/auth/WelcomeModalContainer.js

"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/context/AuthContext';
import { useUsername } from '../../lib/context/UsernameContext';
import { generateUsername } from '../../lib/utils/userUtils';
import WelcomeModal from './WelcomeModal';

export default function WelcomeModalContainer() {
  const { user, needsUsername, finalizeUserRegistration } = useAuth();
  const { showWelcomeModal, setShowWelcomeModal } = useUsername();
  const [initialUsername, setInitialUsername] = useState('');

  useEffect(() => {
    if (needsUsername && !showWelcomeModal && user?.emailVerified) {
      const setup = async () => {
        const username = await generateUsername();
        setInitialUsername(username);
        setShowWelcomeModal(true);
      };
      setup();
    }
  }, [needsUsername, showWelcomeModal, user?.emailVerified]);

  const handleConfirm = async (username) => {
    await finalizeUserRegistration(username);
    setShowWelcomeModal(false);
  };

  return (
    <WelcomeModal
      isOpen={showWelcomeModal}
      onClose={() => {}} // Empty function since we don't want to allow closing
      initialUsername={initialUsername}
      email={user?.email || ''}
      onConfirm={handleConfirm}
    />
  );
}