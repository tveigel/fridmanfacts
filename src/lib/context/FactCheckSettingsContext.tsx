// src/lib/context/FactCheckSettingsContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from './AuthContext';
import { 
  FactCheck, 
  FactCheckSettings, 
  FactCheckSettingsContextType 
} from '../types/core-types';

export const SYSTEM_DEFAULT_SETTINGS: FactCheckSettings = {
  showValidatedTrue: true,
  showValidatedFalse: false,
  showValidatedControversial: true,
  showUnvalidated: true,
  minNetVotes: -999,
  moderatorOnly: false,
};

interface FactCheckSettingsProviderProps {
  children: ReactNode;
}

const FactCheckSettingsContext = createContext<FactCheckSettingsContextType | null>(null);

export function FactCheckSettingsProvider({ children }: FactCheckSettingsProviderProps): JSX.Element {
  const { user } = useAuth();
  const [settings, setSettings] = useState<FactCheckSettings>(SYSTEM_DEFAULT_SETTINGS);
  const [userDefaults, setUserDefaults] = useState<FactCheckSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        
        if (user) {
          const userSettingsRef = doc(db, 'userSettings', user.uid);
          const userSettingsDoc = await getDoc(userSettingsRef);
          
          if (userSettingsDoc.exists()) {
            const data = userSettingsDoc.data();
            const savedDefaults = data.defaultSettings || SYSTEM_DEFAULT_SETTINGS;
            setUserDefaults(savedDefaults);
            setSettings(savedDefaults);
          } else {
            setUserDefaults(SYSTEM_DEFAULT_SETTINGS);
            setSettings(SYSTEM_DEFAULT_SETTINGS);
          }
        } else {
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

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('factCheckSettings', JSON.stringify(settings));
    }
  }, [settings, loading]);

  const updateSettings = (newSettings: FactCheckSettings): void => {
    setSettings(newSettings);
  };

  const updateSingleSetting = (key: keyof FactCheckSettings, value: boolean | number): void => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveAsDefault = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const userSettingsRef = doc(db, 'userSettings', user.uid);
      const updatedDefaults = { ...settings };
      
      await setDoc(userSettingsRef, {
        defaultSettings: updatedDefaults,
        currentSettings: updatedDefaults,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      setUserDefaults(updatedDefaults);
      localStorage.setItem('factCheckSettings', JSON.stringify(updatedDefaults));
      
      return true;
    } catch (error) {
      console.error('Error saving default settings:', error);
      return false;
    }
  };

  const resetToDefaults = (): void => {
    const defaultsToUse = userDefaults || SYSTEM_DEFAULT_SETTINGS;
    setSettings(defaultsToUse);
    localStorage.setItem('factCheckSettings', JSON.stringify(defaultsToUse));
  };

  const shouldShowFactCheck = (factCheck: FactCheck): boolean => {
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

  const contextValue: FactCheckSettingsContextType = {
    settings,
    updateSettings,
    updateSingleSetting,
    resetToDefaults,
    shouldShowFactCheck,
    saveAsDefault,
    loading,
    userDefaults,
    SYSTEM_DEFAULT_SETTINGS
  };

  return (
    <FactCheckSettingsContext.Provider value={contextValue}>
      {children}
    </FactCheckSettingsContext.Provider>
  );
}

export function useFactCheckSettings(): FactCheckSettingsContextType {
  const context = useContext(FactCheckSettingsContext);
  if (!context) {
    throw new Error('useFactCheckSettings must be used within a FactCheckSettingsProvider');
  }
  return context;
}