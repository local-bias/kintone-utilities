import { createContext, useContext, type ReactNode } from 'react';
import { defaultLang, useTranslations } from './i18n';

type ContextType = {
  readonly lang: string;
  readonly t: (key: string) => string;
};

const Context = createContext<ContextType | null>(null);

export function useI18n() {
  const context = useContext(Context);
  if (context === null) {
    throw new Error('useLang must be used within a LangProvider');
  }
  return context;
}

type LangProviderProps = {
  lang?: string;
  children: ReactNode;
};

export function I18nProvider({ lang = defaultLang, children }: LangProviderProps) {
  const t = useTranslations(lang);
  return <Context.Provider value={{ lang, t }}>{children}</Context.Provider>;
}
