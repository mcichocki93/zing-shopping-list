import { Pressable, Text, StyleSheet, type ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE, FONT_WEIGHT } from '../../constants';

interface PixelButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'danger';
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

export function PixelButton({
  title,
  onPress,
  variant = 'accent',
  disabled = false,
  accessibilityLabel,
  style,
}: PixelButtonProps) {
  const bgColor = disabled ? COLORS.disabled : COLORS[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bgColor },
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={styles.text}>{title}</Text>
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
  text: {
    color: COLORS.white,
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
  },
});
