import { View, Text, TextInput, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE, FONT_WEIGHT } from '../../constants';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  accessibilityLabel = 'Ilość',
  style,
}: QuantityStepperProps) {
  const canDecrement = value - step >= min;
  const canIncrement = value + step <= max;

  const onDecrement = () => {
    if (canDecrement) onChange(Math.max(min, value - step));
  };

  const onIncrement = () => {
    if (canIncrement) onChange(Math.min(max, value + step));
  };

  const onChangeText = (text: string) => {
    const normalized = text.replace(',', '.');
    if (normalized === '' || normalized === '.') {
      onChange(min);
      return;
    }
    const parsed = parseFloat(normalized);
    if (!isNaN(parsed)) {
      onChange(Math.min(max, Math.max(min, parsed)));
    }
  };

  const displayValue = Number.isInteger(value) ? String(value) : value.toFixed(1);

  return (
    <View style={[styles.container, style]} accessibilityLabel={accessibilityLabel} accessibilityRole="adjustable">
      <Pressable
        onPress={onDecrement}
        disabled={!canDecrement}
        accessibilityRole="button"
        accessibilityLabel={`Zmniejsz ${accessibilityLabel}`}
        accessibilityState={{ disabled: !canDecrement }}
        style={({ pressed }) => [
          styles.button,
          !canDecrement && styles.buttonDisabled,
          pressed && canDecrement && styles.buttonPressed,
        ]}
      >
        <Text style={[styles.buttonText, !canDecrement && styles.buttonTextDisabled]}>-</Text>
      </Pressable>

      <TextInput
        value={displayValue}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        selectTextOnFocus
        style={styles.input}
        accessibilityLabel={`${accessibilityLabel}: ${displayValue}`}
      />

      <Pressable
        onPress={onIncrement}
        disabled={!canIncrement}
        accessibilityRole="button"
        accessibilityLabel={`Zwiększ ${accessibilityLabel}`}
        accessibilityState={{ disabled: !canIncrement }}
        style={({ pressed }) => [
          styles.button,
          !canIncrement && styles.buttonDisabled,
          pressed && canIncrement && styles.buttonPressed,
        ]}
      >
        <Text style={[styles.buttonText, !canIncrement && styles.buttonTextDisabled]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    minWidth: TOUCH.minTarget,
    minHeight: TOUCH.minTarget,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    borderRadius: BORDERS.radius,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    borderColor: COLORS.disabled,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: FONT_SIZE.h2,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  buttonTextDisabled: {
    color: COLORS.disabled,
  },
  input: {
    minWidth: 48,
    minHeight: TOUCH.minTarget,
    textAlign: 'center',
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    borderTopWidth: BORDERS.width,
    borderBottomWidth: BORDERS.width,
    borderColor: COLORS.border,
    borderRadius: BORDERS.radius,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xs,
  },
});
