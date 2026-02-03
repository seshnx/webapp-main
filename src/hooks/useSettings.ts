import { useEffect } from 'react';

/**
 * Settings interface
 * Defines all user-configurable settings
 */
export interface UserSettings {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  timezone?: string;
  currency?: string;
  dateFormat?: string;
  timeFormat?: string;
  numberFormat?: string;
  accessibility?: {
    fontSize?: 'small' | 'medium' | 'large' | 'xlarge';
    reducedMotion?: boolean;
    highContrast?: boolean;
  };
}

/**
 * User data interface
 */
export interface UserData {
  id?: string;
  [key: string]: any;
}

/**
 * Hook to apply user settings immediately on the client side
 * This hook watches for settings changes and applies them to the DOM/CSS
 *
 * @param settings - User settings object
 * @param userData - User data (optional, kept for compatibility)
 *
 * @example
 * function App() {
 *   const { settings } = useUserSettings();
 *   useSettings(settings, userData);
 *   return <div>...</div>;
 * }
 */
export function useSettings(settings: UserSettings | null | undefined, userData?: UserData | null): void {
  useEffect(() => {
    if (!settings) return;

    // Apply theme
    if (settings.theme) {
      const root = document.documentElement;
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
      const root = document.documentElement;
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
      const root = document.documentElement;
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
      const root = document.documentElement;
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

    // Apply timezone
    if (settings.timezone && settings.timezone !== 'auto') {
      localStorage.setItem('timezone', settings.timezone);
    }

    // Apply currency
    if (settings.currency) {
      localStorage.setItem('currency', settings.currency);
    }

    // Apply date/time formats
    if (settings.dateFormat) {
      localStorage.setItem('dateFormat', settings.dateFormat);
    }
    if (settings.timeFormat) {
      localStorage.setItem('timeFormat', settings.timeFormat);
    }

    // Apply number format
    if (settings.numberFormat) {
      localStorage.setItem('numberFormat', settings.numberFormat);
    }

    // Store all settings in localStorage for persistence
    localStorage.setItem('userSettings', JSON.stringify(settings));

  }, [settings]);
}

/**
 * Initialize settings from localStorage on app load
 *
 * @returns Stored settings or null
 *
 * @example
 * const settings = initializeSettingsFromStorage();
 * if (settings) {
 *   applySettings(settings);
 * }
 */
export function initializeSettingsFromStorage(): UserSettings | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem('userSettings');
  if (stored) {
    try {
      return JSON.parse(stored) as UserSettings;
    } catch (e) {
      console.error('Failed to parse stored settings:', e);
    }
  }
  return null;
}

/**
 * Format date according to user's preference
 *
 * @param date - Date to format
 * @param format - Date format (optional, uses stored preference)
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date(), 'DD/MM/YYYY'); // "25/01/2026"
 * formatDate(new Date()); // Uses stored preference
 */
export function formatDate(date: string | Date | null | undefined, format?: string | null): string {
  if (!date) return '';

  const storedFormat = format || localStorage.getItem('dateFormat') || 'MM/DD/YYYY';
  const d = new Date(date);

  if (isNaN(d.getTime())) return String(date);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  switch (storedFormat) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    default:
      return `${month}/${day}/${year}`;
  }
}

/**
 * Format time according to user's preference
 *
 * @param date - Date to format
 * @param format - Time format (optional, uses stored preference)
 * @returns Formatted time string
 *
 * @example
 * formatTime(new Date(), '24h'); // "14:30"
 * formatTime(new Date()); // Uses stored preference
 */
export function formatTime(date: string | Date | null | undefined, format?: string | null): string {
  if (!date) return '';

  const storedFormat = format || localStorage.getItem('timeFormat') || '12h';
  const d = new Date(date);

  if (isNaN(d.getTime())) return String(date);

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');

  if (storedFormat === '24h') {
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  } else {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }
}

/**
 * Format currency according to user's preference
 *
 * @param amount - Amount to format
 * @param currency - Currency code (optional, uses stored preference)
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1234.56, 'EUR'); // "€1,234.56"
 * formatCurrency(1234.56); // Uses stored preference
 */
export function formatCurrency(amount: number, currency?: string | null): string {
  const storedCurrency = currency || localStorage.getItem('currency') || 'USD';
  const storedFormat = localStorage.getItem('numberFormat') || '1,000.00';

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: storedCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  let formatted = formatter.format(amount);

  // Apply number format preference
  if (storedFormat === '1.000,00') {
    formatted = formatted.replace(/,/g, 'TEMP').replace(/\./g, ',').replace(/TEMP/g, '.');
  } else if (storedFormat === '1 000.00') {
    formatted = formatted.replace(/,/g, ' ');
  }

  return formatted;
}
