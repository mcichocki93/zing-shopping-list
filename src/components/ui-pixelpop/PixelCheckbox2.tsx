// PixelCheckbox2.tsx — checkbox w stylu Pixel Pop (zaznaczony = wypełniony ink + biały check).
// Skopiuj do: src/components/ui-pixelpop/PixelCheckbox2.tsx

import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { PP, PP_BORDER } from '../../constants/pixelPopTheme';
import { PixelIcon } from './PixelIcon';

interface PixelCheckbox2Props {
  checked: boolean;
  onToggle: () => void;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

export function PixelCheckbox2({ checked, onToggle, accessibilityLabel, style }: PixelCheckbox2Props) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={10}
      style={[styles.box, { backgroundColor: checked ? PP.ink : PP.panel }, style]}
    >
      {checked && <PixelIcon name="check" size={12} color={PP.paper} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 22, height: 22, alignItems: 'center', justifyContent: 'center',
    borderWidth: PP_BORDER.base, borderColor: PP.ink,
  },
});

export default PixelCheckbox2;
