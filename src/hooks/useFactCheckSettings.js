// hooks/useFactCheckSettings.js
import { useState, useEffect, useCallback } from 'react';

export const DEFAULT_SETTINGS = {
  showValidatedTrue: true,
  showValidatedFalse: true,
  showValidatedControversial: true,
  showUnvalidated: true,
  minNetVotes: -2,
  moderatorOnly: false,
};

export function useFactCheckSettings() {
  const [settings, setSettings] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    
    try {
      const savedSettings = localStorage.getItem('factCheckSettings');
      return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading settings:', error);
      return DEFAULT_SETTINGS;
    }
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem('factCheckSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [settings]);

  const shouldShowFactCheck = useCallback((factCheck) => {
    if (!factCheck) return false;

    // Calculate net votes
    const netVotes = (factCheck.upvotes || 0) - (factCheck.downvotes || 0);

    // Check minimum net votes threshold
    if (netVotes < settings.minNetVotes) {
      return false;
    }

    // Determine status - first check moderator validation, then default status
    const status = factCheck.moderatorValidation || factCheck.status || 'UNVALIDATED';

    // Check moderator validation requirement
    if (settings.moderatorOnly && !factCheck.moderatorValidation) {
      return false;
    }

    // Check status filters
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

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    updateSetting,
    shouldShowFactCheck,
    resetSettings,
    DEFAULT_SETTINGS,
  };
}