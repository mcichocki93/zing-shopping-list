import { Pressable, View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE } from '../../constants';

interface PixelCheckboxProps {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  label?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export function PixelCheckbox({
  checked,
  onToggle,
  label,
  accessibilityLabel,
  disabled = false,
  style,
}: PixelCheckboxProps) {
  return (
    <Pressable
      onPress={() => !disabled && onToggle(!checked)}
      style={[styles.container, style]}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={accessibilityLabel || label || 'Zaznacz'}
    >
      <View
        style={[
          styles.box,
          checked && styles.boxChecked,
          disabled && styles.boxDisabled,
        ]}
      >
        {checked && <View style={styles.fill} />}
      </View>
      {label && (
        <Text style={[styles.label, checked && styles.labelChecked]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH.minTarget,
    minWidth: TOUCH.minTarget,
    gap: SPACING.sm,
  },
  box: {
    width: 24,
    height: 24,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    borderRadius: BORDERS.radius,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  boxChecked: {
    borderColor: COLORS.accent,
  },
  boxDisabled: {
    borderColor: COLORS.disabled,
  },
  fill: {
    width: 14,
    height: 14,
    backgroundColor: COLORS.accent,
  },
  label: {
    fontSize: FONT_SIZE.body,
    color: COLORS.primary,
  },
  labelChecked: {
    textDecorationLine: 'line-through',
    color: COLORS.disabled,
  },
});
