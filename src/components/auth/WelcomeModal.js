import React, { useState } from 'react';
import { X } from 'lucide-react';
import Modal from '../common/Modal';
import { generateUsername } from '../../lib/utils/userUtils';

export default function WelcomeModal({ isOpen, onClose, initialUsername, email, onConfirm }) {
  const [username, setUsername] = useState(initialUsername);

  const handleRegenerate = async () => {
    const newUsername = await generateUsername();
    setUsername(newUsername);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 bg-white rounded-lg max-w-md w-full mx-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close welcome modal"
        >
          <X size={20} className="text-gray-500" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">Welcome!</h2>
        
        <p className="text-gray-600 mb-6 text-center">
          Welcome {email}! Your username will be:
        </p>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 p-3 bg-gray-50 rounded-lg text-center font-mono">
            {username}
          </div>
          <button
            onClick={handleRegenerate}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            Regenerate
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-6 text-center">
          Note: Your username cannot be changed after proceeding.
        </p>

        <button
          onClick={() => onConfirm(username)}
          className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Proceed with this username
        </button>
      </div>
    </Modal>
  );
}