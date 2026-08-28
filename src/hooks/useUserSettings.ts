/**
 * User Settings Hook
 * Convex-based account settings management
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

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
  privacy?: Record<string, any>;
  notifications?: Record<string, any>;
  messaging?: Record<string, any>;
  social?: Record<string, any>;
  bookings?: Record<string, any>;
  marketplace?: Record<string, any>;
  content?: Record<string, any>;
  ui?: Record<string, any>;
  performance?: Record<string, any>;
  [key: string]: any;
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
    highContrast: false,
  },
};

/**
 * Hook for managing user settings directly on the accounts Convex record
 *
 * @param userId - User Clerk ID (optional, for logged-in users)
 * @returns Settings state and management functions
 */
export function useUserSettings(userId?: string | null): UseUserSettingsReturn {
  const [error, setError] = useState<string | null>(null);

  // Query account data from Convex
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    userId ? { clerkId: userId } : 'skip'
  );

  const updateProfileMutation = useMutation(api.users.updateProfile);

  // Compute merged settings
  const settings = useMemo<UserSettings>(() => {
    if (!userId) {
      return DEFAULT_SETTINGS;
    }
    const userSettings = convexUser?.settings;
    if (userSettings && typeof userSettings === 'object') {
      return {
        ...DEFAULT_SETTINGS,
        ...userSettings,
        accessibility: {
          ...DEFAULT_SETTINGS.accessibility,
          ...(userSettings.accessibility || {}),
        },
      };
    }
    return DEFAULT_SETTINGS;
  }, [userId, convexUser?.settings]);

  // Apply settings to DOM when loaded from Convex
  useEffect(() => {
    if (settings) {
      applySettingsToDom(settings);
    }
  }, [settings]);

  // Refresh settings callback (Convex is real-time, but provided for API compatibility)
  const refreshSettings = useCallback(async () => {
    // Convex queries update automatically in real-time
  }, []);

  // Save settings directly to Convex account
  const saveSettings = useCallback(
    async (newSettings: UserSettings): Promise<boolean> => {
      if (!userId) {
        console.warn('Cannot save settings: No user ID provided');
        return false;
      }

      setError(null);

      try {
        await updateProfileMutation({
          clerkId: userId,
          settings: newSettings,
        });

        // Apply settings to localStorage and DOM
        applySettingsToDom(newSettings);

        return true;
      } catch (err) {
        console.error('Error saving settings to Convex account:', err);
        setError(err instanceof Error ? err.message : 'Failed to save settings');
        return false;
      }
    },
    [userId, updateProfileMutation]
  );

  return {
    settings,
    loading: userId ? convexUser === undefined : false,
    error,
    saveSettings,
    refreshSettings,
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
      small: '10px',
      medium: '12px',
      large: '14px',
      xlarge: '16px',
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