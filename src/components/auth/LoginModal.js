// src/components/auth/LoginModal.js
import { X } from 'lucide-react';
import Login from './Login';

export default function LoginModal({ onClose, onSuccessfulLogin }) {
  return (
    <div className="p-6 bg-white rounded-lg max-w-md w-full mx-auto relative">
      {/* Close Button */}
      <button
        onClick={onClose}
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

      <Login onSuccessfulLogin={onSuccessfulLogin} />
    </div>
  );
}