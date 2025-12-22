import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation, getTranslations } from '../i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children, userData }) {
  // Get language from settings or localStorage, default to 'en'
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('language');
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

  const t = (key) => getTranslation(key, language);
  const translations = getTranslations(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if not in provider
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key) => key,
      translations: getTranslations('en'),
    };
  }
  return context;
}

