// fonts.ts — ładowanie fontów Pixel Pop.
//
// WAŻNE: importujemy z podścieżek (`@expo-google-fonts/inter/400Regular`), a nie
// z korzenia paczki. Import barrelowy wciąga do bundla WSZYSTKIE wagi i kursywy —
// w przypadku Intera to 18 plików po ~345 kB, czyli ~6 MB martwego balastu.
// Na webie (PWA) to pierwsze, co użytkownik musi pobrać, więc bierzemy tylko to,
// czego faktycznie używa PP_FONT w constants/pixelPopTheme.ts.
//
// Użycie w App.tsx:
//   const fontsLoaded = usePixelPopFonts();
//   if (!fontsLoaded) return null;

import { useFonts } from 'expo-font';
import { Silkscreen_400Regular } from '@expo-google-fonts/silkscreen/400Regular';
import { Silkscreen_700Bold } from '@expo-google-fonts/silkscreen/700Bold';
import { PixelifySans_400Regular } from '@expo-google-fonts/pixelify-sans/400Regular';
import { PixelifySans_700Bold } from '@expo-google-fonts/pixelify-sans/700Bold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Inter_800ExtraBold } from '@expo-google-fonts/inter/800ExtraBold';

export function usePixelPopFonts(): boolean {
  const [loaded] = useFonts({
    Silkscreen_400Regular,
    Silkscreen_700Bold,
    PixelifySans_400Regular,
    PixelifySans_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  return loaded;
}
