import { createContext, useContext, ReactNode } from 'react';
import { useTranslations } from '@/hooks/useTranslations';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always English — Google Translate handles other languages in the browser
  const { data: translationMap } = useTranslations('en');

  const t = (key: string): string => {
    if (!translationMap) return key;
    return translationMap[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language: 'en', setLanguage: () => {}, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
