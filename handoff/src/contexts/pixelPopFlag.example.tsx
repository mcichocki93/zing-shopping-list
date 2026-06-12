// pixelPopFlag.example.tsx — jak dodać flagę usePixelPop + akcent.
// Dwie opcje: (A) rozszerz istniejący ThemeContext, (B) osobny mały kontekst (poniżej).
// Najprościej: wklej to do src/contexts/PixelPopContext.tsx i owiń aplikację <PixelPopProvider>.

import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PP } from '../constants/pixelPopTheme';

interface PixelPopState {
  enabled: boolean;          // czy nowy wygląd włączony
  accent: string;            // kolor akcentu
  toggle: () => void;
  setAccent: (c: string) => void;
}

const Ctx = createContext<PixelPopState>({
  enabled: false,
  accent: PP.pink,
  toggle: () => {},
  setAccent: () => {},
});

const KEY_ENABLED = '@zing/pixelpop_enabled';
const KEY_ACCENT = '@zing/pixelpop_accent';

export function PixelPopProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [accent, setAccentState] = useState(PP.pink);

  // wczytanie zapisanej preferencji
  React.useEffect(() => {
    (async () => {
      const e = await AsyncStorage.getItem(KEY_ENABLED);
      const a = await AsyncStorage.getItem(KEY_ACCENT);
      if (e != null) setEnabled(e === '1');
      if (a) setAccentState(a);
    })();
  }, []);

  const toggle = useCallback(() => {
    setEnabled((v) => {
      AsyncStorage.setItem(KEY_ENABLED, v ? '0' : '1');
      return !v;
    });
  }, []);

  const setAccent = useCallback((c: string) => {
    setAccentState(c);
    AsyncStorage.setItem(KEY_ACCENT, c);
  }, []);

  return <Ctx.Provider value={{ enabled, accent, toggle, setAccent }}>{children}</Ctx.Provider>;
}

export function usePixelPop() {
  return useContext(Ctx);
}

// Użycie w ekranie:
//   const { enabled, accent } = usePixelPop();
//   if (enabled) return <PixelPopDashboard accent={accent} ... />;
//
// Włączenie/wyłączenie (np. w Profilu): const { toggle } = usePixelPop();
// Zmiana akcentu (swatche #FF3B8F / #FFD12E / #6B4BFF / #3BE3FF): setAccent(c)
