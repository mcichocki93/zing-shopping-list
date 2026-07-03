import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase/config';
import { COLLECTIONS } from '../constants';
import { THEMES, DEFAULT_THEME, type ThemeName, type AppTheme } from '../constants/themes';
import { PP } from '../constants/pixelPopTheme';
import { useAuth } from '../features/auth/hooks';
import i18n, { deviceLanguage, type AppLanguage } from '../i18n';

interface ThemeContextValue {
  theme: AppTheme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => Promise<void>;
  pixelPopEnabled: boolean;
  setPixelPopEnabled: (enabled: boolean) => void;
  pixelPopAccent: string;
  setPixelPopAccent: (color: string) => Promise<void>;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: THEMES[DEFAULT_THEME],
  themeName: DEFAULT_THEME,
  setTheme: async () => {},
  pixelPopEnabled: false,
  setPixelPopEnabled: () => {},
  pixelPopAccent: PP.pink,
  setPixelPopAccent: async () => {},
  language: 'pl',
  setLanguage: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [themeName, setThemeName] = useState<ThemeName>(DEFAULT_THEME);
  const [pixelPopEnabled, setPixelPopEnabled] = useState(true);
  const [pixelPopAccent, setPixelPopAccentState] = useState<string>(PP.pink);
  const [language, setLanguageState] = useState<AppLanguage>(
    () => (i18n.language as AppLanguage) || deviceLanguage(),
  );

  useEffect(() => {
    if (!user) {
      setThemeName(DEFAULT_THEME);
      setPixelPopAccentState(PP.pink);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, COLLECTIONS.USERS, user.id),
      (snapshot) => {
        const data = snapshot.data();
        if (data?.theme && data.theme in THEMES) {
          setThemeName(data.theme as ThemeName);
        }
        if (data?.pixelPopAccent && typeof data.pixelPopAccent === 'string') {
          setPixelPopAccentState(data.pixelPopAccent);
        }
        if (data?.language === 'pl' || data?.language === 'en') {
          if (i18n.language !== data.language) i18n.changeLanguage(data.language);
          setLanguageState(data.language);
        }
      },
    );

    return unsubscribe;
  }, [user]);

  const setTheme = useCallback(
    async (name: ThemeName) => {
      if (!user) return;
      setThemeName(name);
      await updateDoc(doc(db, COLLECTIONS.USERS, user.id), { theme: name });
    },
    [user],
  );

  const setPixelPopAccent = useCallback(
    async (color: string) => {
      setPixelPopAccentState(color);
      if (!user) return;
      await updateDoc(doc(db, COLLECTIONS.USERS, user.id), { pixelPopAccent: color });
    },
    [user],
  );

  const setLanguage = useCallback(
    async (lang: AppLanguage) => {
      setLanguageState(lang);
      await i18n.changeLanguage(lang);
      if (!user) return;
      await updateDoc(doc(db, COLLECTIONS.USERS, user.id), { language: lang });
    },
    [user],
  );

  const theme = THEMES[themeName];

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme, pixelPopEnabled, setPixelPopEnabled, pixelPopAccent, setPixelPopAccent, language, setLanguage }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
