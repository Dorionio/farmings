"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, LanguageType } from '@/lib/translations';

interface LanguageContextType {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageType>('en');

  // Load language preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('app-language') as LanguageType;
      if (savedLang && (savedLang === 'en' || savedLang === 'fr' || savedLang === 'es' || savedLang === 'ar')) {
        setLanguageState(savedLang);
        updateHtmlAttributes(savedLang);
      }
    }
  }, []);

  const updateHtmlAttributes = (lang: LanguageType) => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  };

  const setLanguage = (lang: LanguageType) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-language', lang);
    }
    updateHtmlAttributes(lang);
  };

  const t = (key: string): string => {
    const langDict = translations[language] || translations['en'];
    return langDict[key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
