// fonts.ts — ładowanie fontów Pixel Pop. Skopiuj do: src/fonts.ts
// Zależności:
//   npx expo install @expo-google-fonts/silkscreen @expo-google-fonts/inter expo-font
//
// Użycie w App.tsx:
//   import { usePixelPopFonts } from './src/fonts';
//   const fontsLoaded = usePixelPopFonts();
//   if (!fontsLoaded) return null; // lub <AppLoading/> / splash
//
// (Jeśli używasz expo-splash-screen, ukryj splash gdy fontsLoaded === true.)

import { useFonts } from 'expo-font';
import { Silkscreen_400Regular, Silkscreen_700Bold } from '@expo-google-fonts/silkscreen';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';

export function usePixelPopFonts(): boolean {
  const [loaded] = useFonts({
    Silkscreen_400Regular,
    Silkscreen_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  return loaded;
}
