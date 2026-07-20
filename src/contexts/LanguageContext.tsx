import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Language, getTranslation } from '@/i18n/translations';
import { getLangFromPath, localizedPath } from '@/i18n/LocalizedLink';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: ReturnType<typeof getTranslation>;
  localizedPath: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const language = getLangFromPath(location.pathname) as Language;

  useEffect(() => {
    document.documentElement.lang = language;
    try { localStorage.setItem('language', language); } catch {}
  }, [language]);

  const value = useMemo<LanguageContextType>(() => ({
    language,
    setLanguage: (lang: Language) => {
      const next = localizedPath(location.pathname, lang);
      navigate(next + location.search + location.hash);
    },
    t: getTranslation(language),
    localizedPath: (path: string) => localizedPath(path, language),
  }), [language, location.pathname, location.search, location.hash, navigate]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
