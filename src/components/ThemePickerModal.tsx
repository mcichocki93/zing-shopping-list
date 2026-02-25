import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { PixelModal } from './ui';
import { COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE, FONT_WEIGHT } from '../constants';
import { THEMES, THEME_NAMES } from '../constants/themes';
import { useTheme } from '../contexts/ThemeContext';

interface ThemePickerModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ThemePickerModal({ visible, onClose }: ThemePickerModalProps) {
  const { themeName, setTheme } = useTheme();

  return (
    <PixelModal visible={visible} onClose={onClose} title="Wybierz motyw">
      {THEME_NAMES.map((name) => {
        const t = THEMES[name];
        const isSelected = name === themeName;
        return (
          <Pressable
            key={name}
            onPress={async () => {
              await setTheme(name);
              onClose();
            }}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={name}
            style={[styles.option, isSelected && styles.optionSelected]}
          >
            <View style={[styles.swatch, { backgroundColor: t.swatch }]} />
            <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{name}</Text>
            {isSelected && <Text style={styles.check}>{'✓'}</Text>}
          </Pressable>
        );
      })}
    </PixelModal>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH.minTarget,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
    gap: SPACING.sm,
  },
  optionSelected: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  swatch: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionText: {
    flex: 1,
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  optionTextSelected: {
    color: COLORS.primary,
  },
  check: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
});
