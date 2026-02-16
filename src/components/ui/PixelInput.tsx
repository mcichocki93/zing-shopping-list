import { TextInput, StyleSheet, type TextInputProps, type ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE } from '../../constants';

interface PixelInputProps extends TextInputProps {
  style?: ViewStyle;
}

export function PixelInput({ style, ...props }: PixelInputProps) {
  return (
    <TextInput
      placeholderTextColor={COLORS.disabled}
      {...props}
      style={[styles.input, style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: TOUCH.minTarget,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    borderRadius: BORDERS.radius,
    backgroundColor: COLORS.white,
    color: COLORS.primary,
    fontSize: FONT_SIZE.body,
  },
});
