import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation, getTranslations } from '../i18n/translations';

/**
 * Supported languages
 */
export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja' | 'ko';

/**
 * Translation key type (can be any string key)
 */
export type TranslationKey = string;

/**
 * Translations object type
 */
export type Translations = Record<string, string>;

/**
 * Language context value interface
 */
export interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: TranslationKey) => string;
  translations: Translations;
}

/**
 * Language provider props interface
 */
export interface LanguageProviderProps {
  children: React.ReactNode;
  userData?: {
    settings?: {
      language?: SupportedLanguage;
    };
  } | null;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

/**
 * Language Provider Component
 *
 * Provides language context to the app with translations
 *
 * @param props - Provider props
 * @returns Language context provider
 *
 * @example
 * function App() {
 *   const [userData] = useState(null);
 *
 *   return (
 *     <LanguageProvider userData={userData}>
 *       <YourApp />
 *     </LanguageProvider>
 *   );
 * }
 */
export function LanguageProvider({ children, userData }: LanguageProviderProps): React.ReactElement {
  // Get language from settings or localStorage, default to 'en'
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('language') as SupportedLanguage;
      if (stored) return stored;
      return userData?.settings?.language || 'en';
    }
    return 'en';
  });

  // Update language when userData settings change
  useEffect(() => {
    if (userData?.settings?.language) {
      setLanguage(userData.settings.language);
      localStorage.setItem('language', userData.settings.language);
      document.documentElement.lang = userData.settings.language;
    }
  }, [userData?.settings?.language]);

  // Apply language to document
  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: TranslationKey): string => getTranslation(key, language);
  const translations = getTranslations(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook for accessing language context
 *
 * @returns Language context value
 * @throws Error if used outside of LanguageProvider
 *
 * @example
 * function MyComponent() {
 *   const { language, setLanguage, t } = useLanguage();
 *
 *   return (
 *     <div>
 *       <p>{t('hello')}</p>
 *       <button onClick={() => setLanguage('es')}>Español</button>
 *     </div>
 *   );
 * }
 */
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if not in provider
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key: TranslationKey) => key,
      translations: getTranslations('en'),
    };
  }
  return context;
}
