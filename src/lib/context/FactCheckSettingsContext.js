"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from './AuthContext';

export const SYSTEM_DEFAULT_SETTINGS = {
  showValidatedTrue: true,
  showValidatedFalse: false,
  showValidatedControversial: true,
  showUnvalidated: true,
  minNetVotes: -999,
  moderatorOnly: false,
};

const FactCheckSettingsContext = createContext(null);

export function FactCheckSettingsProvider({ children }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState(SYSTEM_DEFAULT_SETTINGS);
  const [userDefaults, setUserDefaults] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load settings on mount and when user changes
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        
        if (user) {
          // Try to load user-specific settings from Firestore
          const userSettingsRef = doc(db, 'userSettings', user.uid);
          const userSettingsDoc = await getDoc(userSettingsRef);
          
          if (userSettingsDoc.exists()) {
            const data = userSettingsDoc.data();
            const savedDefaults = data.defaultSettings || SYSTEM_DEFAULT_SETTINGS;
            setUserDefaults(savedDefaults);
            setSettings(savedDefaults); // Initialize with user's defaults
          } else {
            setUserDefaults(SYSTEM_DEFAULT_SETTINGS);
            setSettings(SYSTEM_DEFAULT_SETTINGS);
          }
        } else {
          // If no user is logged in, try to load from localStorage
          const savedSettings = localStorage.getItem('factCheckSettings');
          if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
          } else {
            setSettings(SYSTEM_DEFAULT_SETTINGS);
          }
          setUserDefaults(null);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setSettings(SYSTEM_DEFAULT_SETTINGS);
        setUserDefaults(null);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [user]);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('factCheckSettings', JSON.stringify(settings));
    }
  }, [settings, loading]);

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
  };

  const updateSingleSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveAsDefault = async () => {
    if (!user) return false;

    try {
      const userSettingsRef = doc(db, 'userSettings', user.uid);
      const updatedDefaults = { ...settings };
      
      // Save to Firestore
      await setDoc(userSettingsRef, {
        defaultSettings: updatedDefaults,
        currentSettings: updatedDefaults,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // Update local state
      setUserDefaults(updatedDefaults);
      
      // Update localStorage
      localStorage.setItem('factCheckSettings', JSON.stringify(updatedDefaults));
      
      return true;
    } catch (error) {
      console.error('Error saving default settings:', error);
      return false;
    }
  };

  const resetToDefaults = () => {
    // Reset to user defaults if they exist, otherwise use system defaults
    const defaultsToUse = userDefaults || SYSTEM_DEFAULT_SETTINGS;
    setSettings(defaultsToUse);
    localStorage.setItem('factCheckSettings', JSON.stringify(defaultsToUse));
  };

  const shouldShowFactCheck = (factCheck) => {
    if (!factCheck) return false;

    const netVotes = (factCheck.upvotes || 0) - (factCheck.downvotes || 0);
    if (netVotes < settings.minNetVotes) {
      return false;
    }

    const status = factCheck.moderatorValidation || factCheck.status || 'UNVALIDATED';

    if (settings.moderatorOnly && !factCheck.moderatorValidation) {
      return false;
    }

    switch (status) {
      case 'VALIDATED_TRUE':
        return settings.showValidatedTrue;
      case 'VALIDATED_FALSE':
        return settings.showValidatedFalse;
      case 'VALIDATED_CONTROVERSIAL':
        return settings.showValidatedControversial;
      case 'UNVALIDATED':
        return settings.showUnvalidated;
      default:
        return true;
    }
  };

  return (
    <FactCheckSettingsContext.Provider value={{
      settings,
      updateSettings,
      updateSingleSetting,
      resetToDefaults,
      shouldShowFactCheck,
      saveAsDefault,
      loading,
      userDefaults,
      SYSTEM_DEFAULT_SETTINGS
    }}>
      {children}
    </FactCheckSettingsContext.Provider>
  );
}

export function useFactCheckSettings() {
  const context = useContext(FactCheckSettingsContext);
  if (context === null) {
    throw new Error('useFactCheckSettings must be used within a FactCheckSettingsProvider');
  }
  return context;
}