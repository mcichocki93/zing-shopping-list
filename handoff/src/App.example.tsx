// App.example.tsx — fragment App.tsx: ładowanie fontów + provider flagi.
// Przenieś logikę do swojego App.tsx (nie nadpisuj całego pliku w ciemno).

import React from 'react';
import { usePixelPopFonts } from './src/fonts';
import { PixelPopProvider } from './src/contexts/pixelPopFlag.example'; // -> PixelPopContext

export default function App() {
  const fontsLoaded = usePixelPopFonts();

  // Trzymaj splash / nic nie renderuj póki fonty się nie załadują
  if (!fontsLoaded) return null;

  return (
    <PixelPopProvider>
      {/* 
        ...Twoje istniejące drzewo:
        <SafeAreaProvider>
          <AuthProvider>
            <ThemeProvider>
              <NavigationContainer> ... <RootNavigator/> ... </NavigationContainer>
            </ThemeProvider>
          </AuthProvider>
        </SafeAreaProvider>
      */}
    </PixelPopProvider>
  );
}
