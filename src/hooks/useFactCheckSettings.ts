// src/hooks/useFactCheckSettings.ts
import { useState, useCallback } from 'react';
import { FactCheckSettings, FactCheck } from '../lib/types/core-types';

export const DEFAULT_SETTINGS: FactCheckSettings = {
  showValidatedTrue: true,
  showValidatedFalse: true,
  showValidatedControversial: true,
  showUnvalidated: true,
  minNetVotes: -2,
  moderatorOnly: false,
};

interface UseFactCheckSettingsReturn {
  settings: FactCheckSettings;
  updateSetting: (key: keyof FactCheckSettings, value: boolean | number) => void;
  shouldShowFactCheck: (factCheck: FactCheck) => boolean;
  resetSettings: () => void;
  DEFAULT_SETTINGS: FactCheckSettings;
}

export function useFactCheckSettings(): UseFactCheckSettingsReturn {
  const [settings, setSettings] = useState<FactCheckSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    
    try {
      const savedSettings = localStorage.getItem('factCheckSettings');
      return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading settings:', error);
      return DEFAULT_SETTINGS;
    }
  });

  const updateSetting = useCallback((key: keyof FactCheckSettings, value: boolean | number) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [key]: value
      };
      
      try {
        localStorage.setItem('factCheckSettings', JSON.stringify(newSettings));
      } catch (error) {
        console.error('Error saving settings:', error);
      }
      
      return newSettings;
    });
  }, []);

  const shouldShowFactCheck = useCallback((factCheck: FactCheck): boolean => {
    if (!factCheck) return false;

    const netVotes = (factCheck.upvotes || 0) - (factCheck.downvotes || 0);
    if (netVotes < settings.minNetVotes) {
      return false;
    }

    const status = factCheck.moderatorValidation || factCheck.status;

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
  }, [settings]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem('factCheckSettings', JSON.stringify(DEFAULT_SETTINGS));
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  }, []);

  return {
    settings,
    updateSetting,
    shouldShowFactCheck,
    resetSettings,
    DEFAULT_SETTINGS,
  };
}