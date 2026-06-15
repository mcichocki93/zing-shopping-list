// Fab.tsx — pływający przycisk akcji (+). Skopiuj do: src/components/ui-pixelpop/Fab.tsx

import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PP, PP_BORDER } from '../../constants/pixelPopTheme';
import { HardShadow } from './HardShadow';
import { PixelIcon } from './PixelIcon';

interface FabProps {
  onPress: () => void;
  accent?: string;
  icon?: string;
  bottomOffset?: number; // odległość od dołu (nad tab barem). Domyślnie ~tabbar+safe.
  accessibilityLabel?: string;
}

export function Fab({ onPress, accent = PP.pink, icon = 'plus', bottomOffset, accessibilityLabel = 'Dodaj' }: FabProps) {
  const insets = useSafeAreaInsets();
  const bottom = bottomOffset ?? insets.bottom + 86;
  return (
    <HardShadow offset={4} style={StyleSheet.flatten([styles.wrap, { bottom }])}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [styles.btn, { backgroundColor: accent }, pressed && { opacity: 0.85 }]}
      >
        <PixelIcon name={icon} size={24} color={PP.ink} />
      </Pressable>
    </HardShadow>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 16, zIndex: 25 } as ViewStyle,
  btn: {
    width: 54, height: 54, alignItems: 'center', justifyContent: 'center',
    borderWidth: PP_BORDER.thick, borderColor: PP.ink,
  },
});

export default Fab;
