import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase/config';
import { COLLECTIONS } from '../constants';
import { THEMES, DEFAULT_THEME, type ThemeName, type AppTheme } from '../constants/themes';
import { useAuth } from '../features/auth/hooks';

interface ThemeContextValue {
  theme: AppTheme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: THEMES[DEFAULT_THEME],
  themeName: DEFAULT_THEME,
  setTheme: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [themeName, setThemeName] = useState<ThemeName>(DEFAULT_THEME);

  useEffect(() => {
    if (!user) {
      setThemeName(DEFAULT_THEME);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, COLLECTIONS.USERS, user.id),
      (snapshot) => {
        const data = snapshot.data();
        if (data?.theme && data.theme in THEMES) {
          setThemeName(data.theme as ThemeName);
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

  const theme = THEMES[themeName];

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
