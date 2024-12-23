// src/components/common/Navbar.js

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Settings, X, Star } from 'lucide-react';
import NotificationsIcon from './NotificationsIcon';
import { useAuth } from '@/lib/context/AuthContext';
import Modal from './Modal';
import Logo from '../Logo';
import { SettingsMenu } from '../settings/FactCheckSettings';
import { useFactChecks } from '../../hooks/useFactChecks';
import { useKarma } from '../../hooks/useKarma';
import { KARMA_LEVELS, getKarmaLevel } from '../../lib/utils/karmaConstants';
import UserLevelDisplay from '../fact-checks/core/UserLevelDisplay';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase/firebaseConfig';


// Separate component for display user ID with level
export const UserNameWithLevel = ({ userId, username, className = "" }) => {
  const { karma } = useKarma();
  const currentLevel = getKarmaLevel(karma || 0);
  const levelInfo = KARMA_LEVELS[currentLevel];
  const displayText = username || userId;
  
  return (
    <Link href={`/profile/${username}`}>  {/* Changed from userId to username */}
      <div className={`flex items-center gap-2 ${className} cursor-pointer hover:opacity-80`}>
        <span>{displayText}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${levelInfo.bgColor} ${levelInfo.color}`}>
          {levelInfo.label}
        </span>
      </div>
    </Link>
  );
};

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { allFactChecks } = useFactChecks({ episodeId: null });
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const { karma } = useKarma();

  // Get user's current level info
  const currentLevel = getKarmaLevel(karma || 0);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        const scrollingDown = currentScrollY > lastScrollY;
        const scrollDifference = Math.abs(currentScrollY - lastScrollY);
  
        if (currentScrollY < 100 || (!scrollingDown && scrollDifference > 40)) {
          setIsVisible(true);
        } else if (scrollingDown && currentScrollY > 100 && scrollDifference > 30) {
          setIsVisible(false);
        }
  
        setLastScrollY(currentScrollY);
      }
    };
  
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);
      return () => window.removeEventListener('scroll', controlNavbar);
    }
  }, [lastScrollY]);
  
  // Second useEffect for fetching username
  useEffect(() => {
    if (user) {
      const fetchUsername = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      };
      fetchUsername();
    }
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 bg-black text-white shadow-md z-40 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-[1920px] mx-auto pl-0 pr-6">
          <div className="flex items-center justify-between h-20">
            {/* Left side */}
            <div className="flex items-center gap-10">
              <Logo className="pl-0" />
              <div className="hidden md:flex items-center gap-8">
                <Link href="/episodes" className="text-white hover:text-gray-300">
                  All Episodes
                </Link>
                <Link href="/categories" className="text-white hover:text-gray-300">
                  Categories
                </Link>
                <Link href="/about" className="text-white hover:text-gray-300">
                  About
                </Link>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <form onSubmit={handleSearch} className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search episodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 px-4 py-2 pr-10 rounded-lg border border-gray-600 bg-black text-white focus:outline-none focus:border-white text-base"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <Search size={18} />
                </button>
              </form>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                  aria-label="Settings"
                >
                  <Settings size={20} className="text-white" />
                </button>

                {loading ? (
                  <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
                ) : user ? (
                  <>
                    <NotificationsIcon />
                    
                    {/* User Profile Section */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors">
                        <div className="flex items-center" title="Your Karma Points">
                          <Star className="text-yellow-400 mr-1.5" size={18} />
                          <span className="text-yellow-400 mr-1">Karma</span>
                          <span className="text-lg font-semibold text-yellow-400">{karma || 0}</span>
                          <UserLevelDisplay level={currentLevel} />
                        </div>
                      </div>
                      
                      {/* Username Display */}
                      <UserNameWithLevel 
                      userId={user.uid}
                      username={userData?.username}
                      className="text-white"
                    />
                    </div>

                    <button 
                      onClick={logout}
                      className="px-5 py-2.5 text-base bg-white text-black rounded hover:bg-gray-200"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="px-5 py-2.5 text-base bg-white text-black rounded hover:bg-gray-200"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Portaled components */}
      <div className="portal-container">
        <SettingsMenu
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          factChecks={allFactChecks}
        />

        <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
          <LoginForm onClose={() => setShowLoginModal(false)} />
        </Modal>
      </div>
    </>
  );
}

const LoginForm = ({ onClose }) => {
  const [successMessage, setSuccessMessage] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, loginWithEmail, signUpWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (isSignUp) {
        const message = await signUpWithEmail(email, password);
        setSuccessMessage(message);
      } else {
        await loginWithEmail(email, password);
        onClose();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setLoading(true);
      await login();
      onClose();
    } catch (error) {
      setError("Failed to login with Google");
    } finally {
      setLoading(false);
    }
  };

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
        {isSignUp ? "Create Account" : "Login"}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleEmailSubmit} className="space-y-4 mb-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Processing..." : (isSignUp ? "Sign Up" : "Login")}
        </button>
      </form>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or</span>
        </div>
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
        Continue with Google
      </button>

      <button
        type="button"
        onClick={() => setIsSignUp(!isSignUp)}
        className="w-full mt-4 text-sm text-blue-500 hover:text-blue-600"
      >
        {isSignUp ? "Already have an account? Login" : "Need an account? Sign Up"}
      </button>
    </div>
  );
}