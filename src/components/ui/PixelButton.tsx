import React from 'react';
import { Pressable, View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE, FONT_WEIGHT } from '../../constants';
import { useTheme } from '../../contexts/ThemeContext';

interface PixelButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'danger' | 'accentMuted';
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function PixelButton({
  title,
  onPress,
  variant = 'accent',
  disabled = false,
  accessibilityLabel,
  style,
  icon,
}: PixelButtonProps) {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return COLORS.disabled;
    switch (variant) {
      case 'accent':
        return theme.accent;
      case 'accentMuted':
        return theme.accentMuted;
      case 'danger':
        return COLORS.danger;
      case 'primary':
      default:
        return COLORS.primary;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: getBackgroundColor() },
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {icon ? (
        <View style={styles.content}>
          {icon}
          <Text style={styles.text}>{title}</Text>
        </View>
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: TOUCH.minTarget,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    borderRadius: BORDERS.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  text: {
    color: COLORS.white,
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
  },
});
