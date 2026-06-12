// GlassBar.tsx — pływający pasek „pixel-glass": blur + półprzezroczyste tło,
// ale OSTRE narożniki + ink border + górny refleks. Baza pod tab bar i compose bar.
// Skopiuj do: src/components/ui-pixelpop/GlassBar.tsx
// Zależności: npx expo install expo-blur
//
// Android: BlurView bywa słaby — komponent dokłada mocniejszą nakładkę jako fallback.

import React from 'react';
import { View, Platform, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PP, PP_BORDER } from '../../constants/pixelPopTheme';

interface GlassBarProps {
  children: React.ReactNode;
  style?: ViewStyle;          // nadpisania kontenera (np. left/right/bottom)
  contentStyle?: ViewStyle;   // padding wewnętrzny
  floating?: boolean;         // true = odklejony z marginesem; false = pełna szerokość przy dole
}

export function GlassBar({ children, style, contentStyle, floating = false }: GlassBarProps) {
  const insets = useSafeAreaInsets();
  // Na Androidzie blur słabszy → mocniejsza nakładka
  const overlayAlpha = Platform.OS === 'android' ? 0.9 : 0.7;

  return (
    <View
      style={[
        styles.base,
        floating
          ? { left: 12, right: 12, bottom: insets.bottom + 10, borderWidth: PP_BORDER.thin, borderColor: PP.ink }
          : { left: 0, right: 0, bottom: 0, borderTopWidth: PP_BORDER.thin, borderTopColor: PP.ink },
        style,
      ]}
    >
      <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(255,248,238,${overlayAlpha})` }]} />
      {/* górny refleks */}
      <View style={styles.sheen} pointerEvents="none" />
      <View
        style={[
          { paddingTop: 12, paddingBottom: floating ? 12 : insets.bottom + 8, paddingHorizontal: 12 },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { position: 'absolute', overflow: 'hidden', zIndex: 20 },
  sheen: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: 'rgba(255,255,255,0.55)' },
});

export default GlassBar;
