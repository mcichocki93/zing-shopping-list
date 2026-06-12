// HardShadow.tsx — twardy, offsetowy „pixelowy" cień (box-shadow: x y 0 0 color).
// RN nie ma takiego cienia natywnie, więc renderujemy duplikat tła pod spodem.
// Skopiuj do: src/components/ui-pixelpop/HardShadow.tsx
//
// Użycie:
//   <HardShadow offset={4}>
//     <View style={{ backgroundColor:'#fff', borderWidth:3, borderColor:PP.ink, padding:12 }}>
//       ...
//     </View>
//   </HardShadow>
//
// WAŻNE: dziecko musi mieć WŁASNE tło i border. HardShadow dodaje tylko
// przesuniętą warstwę cienia. Nie nadawaj dziecku marginesów — owiń je zamiast tego.

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { PP } from '../../constants/pixelPopTheme';

interface HardShadowProps {
  children: React.ReactNode;
  offset?: number;
  color?: string;
  style?: ViewStyle; // np. flex:1, alignSelf, width
}

export function HardShadow({ children, offset = 4, color = PP.ink, style }: HardShadowProps) {
  return (
    <View style={[styles.wrap, style]}>
      <View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: color, transform: [{ translateX: offset }, { translateY: offset }] },
        ]}
      />
      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
});

export default HardShadow;
