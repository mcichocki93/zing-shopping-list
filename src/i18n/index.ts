import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import pl from './locales/pl.json';
import en from './locales/en.json';

export const SUPPORTED_LANGUAGES = ['pl', 'en'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Język urządzenia zawężony do wspieranych; domyślnie PL. */
export function deviceLanguage(): AppLanguage {
  const code = Localization.getLocales()[0]?.languageCode ?? 'pl';
  return code === 'en' ? 'en' : 'pl';
}

i18n.use(initReactI18next).init({
  resources: {
    pl: { translation: pl },
    en: { translation: en },
  },
  lng: deviceLanguage(),
  fallbackLng: 'pl',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
