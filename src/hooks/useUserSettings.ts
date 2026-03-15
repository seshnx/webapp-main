/**
 * User Settings Hook
 * MongoDB-based settings management
 */

import { useState, useEffect, useCallback } from 'react';

export interface UserSettings {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  dateFormat?: string;
  timeFormat?: string;
  timezone?: string;
  currency?: string;
  accessibility?: {
    fontSize?: 'small' | 'medium' | 'large' | 'xlarge';
    reducedMotion?: boolean;
    highContrast?: boolean;
  };
}

interface UseUserSettingsReturn {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  saveSettings: (settings: UserSettings) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  language: 'en',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  timezone: 'auto',
  currency: 'USD',
  accessibility: {
    fontSize: 'medium',
    reducedMotion: false,
    highContrast: false
  }
};

/**
 * Hook for managing user settings with MongoDB backend
 *
 * @param userId - User ID (optional, for logged-in users)
 * @returns Settings state and management functions
 */
export function useUserSettings(userId?: string | null): UseUserSettingsReturn {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings from MongoDB
  const refreshSettings = useCallback(async () => {
    if (!userId) {
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/settings?user_id=${encodeURIComponent(userId)}`);
      if (!response.ok) {
        throw new Error('Failed to load settings');
      }

      const data = await response.json();
      setSettings(data);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      // Set default settings on error
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Save settings to MongoDB
  const saveSettings = useCallback(async (newSettings: UserSettings): Promise<boolean> => {
    if (!userId) {
      console.warn('Cannot save settings: No user ID provided');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          settings: newSettings
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const data = await response.json();
      setSettings(data);

      // Apply settings to localStorage and DOM
      applySettingsToDom(newSettings);

      return true;
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load settings on mount
  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  return {
    settings,
    loading,
    error,
    saveSettings,
    refreshSettings
  };
}

/**
 * Apply settings to DOM and localStorage
 */
export function applySettingsToDom(settings: UserSettings): void {
  const root = document.documentElement;

  // Apply theme
  if (settings.theme) {
    if (settings.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } else if (settings.theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  // Apply font size
  if (settings.accessibility?.fontSize) {
    const fontSizes: Record<string, string> = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px',
    };
    root.style.fontSize = fontSizes[settings.accessibility.fontSize] || fontSizes.medium;
    localStorage.setItem('fontSize', settings.accessibility.fontSize);
  }

  // Apply reduced motion
  if (settings.accessibility?.reducedMotion !== undefined) {
    if (settings.accessibility.reducedMotion) {
      root.classList.add('reduce-motion');
      root.style.setProperty('--motion-duration', '0s');
    } else {
      root.classList.remove('reduce-motion');
      root.style.removeProperty('--motion-duration');
    }
    localStorage.setItem('reducedMotion', String(settings.accessibility.reducedMotion));
  }

  // Apply high contrast
  if (settings.accessibility?.highContrast !== undefined) {
    if (settings.accessibility.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem('highContrast', String(settings.accessibility.highContrast));
  }

  // Apply language
  if (settings.language) {
    document.documentElement.lang = settings.language;
    localStorage.setItem('language', settings.language);
  }

  // Store all settings in localStorage for persistence
  localStorage.setItem('userSettings', JSON.stringify(settings));
}