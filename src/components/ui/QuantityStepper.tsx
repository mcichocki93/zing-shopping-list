import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE, FONT_WEIGHT } from '../../constants';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { theme } = useTheme();
  const canDecrement = value - step >= min;
  const canIncrement = value + step <= max;

  // Internal text state — allows free typing without immediate parse/reset
  const isFocused = useRef(false);
  const [text, setText] = useState(() =>
    Number.isInteger(value) ? String(value) : String(value).replace('.', ','),
  );

  // Sync display when value changes externally (e.g. +/- buttons) but not while typing
  useEffect(() => {
    if (!isFocused.current) {
      setText(Number.isInteger(value) ? String(value) : String(value).replace('.', ','));
    }
  }, [value]);

  const commitText = (raw: string) => {
    const normalized = raw.replace(',', '.');
    const parsed = parseFloat(normalized);
    if (!isNaN(parsed) && parsed > 0) {
      const clamped = Math.min(max, Math.max(min, parsed));
      onChange(clamped);
      setText(Number.isInteger(clamped) ? String(clamped) : String(clamped).replace('.', ','));
    } else {
      // Restore to current valid value
      setText(Number.isInteger(value) ? String(value) : String(value).replace('.', ','));
    }
  };

  const onDecrement = () => {
    if (canDecrement) onChange(Math.max(min, value - step));
  };

  const onIncrement = () => {
    if (canIncrement) onChange(Math.min(max, value + step));
  };

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
          canDecrement
            ? { backgroundColor: theme.accent }
            : styles.buttonDisabled,
          pressed && canDecrement && styles.buttonPressed,
        ]}
      >
        <Text style={[styles.buttonText, canDecrement ? styles.buttonTextEnabled : styles.buttonTextDisabled]}>-</Text>
      </Pressable>

      <TextInput
        value={text}
        onChangeText={setText}
        onFocus={() => { isFocused.current = true; }}
        onBlur={() => { isFocused.current = false; commitText(text); }}
        onEndEditing={() => { isFocused.current = false; commitText(text); }}
        keyboardType="decimal-pad"
        selectTextOnFocus
        style={styles.input}
        accessibilityLabel={`${accessibilityLabel}: ${text}`}
      />

      <Pressable
        onPress={onIncrement}
        disabled={!canIncrement}
        accessibilityRole="button"
        accessibilityLabel={`Zwiększ ${accessibilityLabel}`}
        accessibilityState={{ disabled: !canIncrement }}
        style={({ pressed }) => [
          styles.button,
          canIncrement
            ? { backgroundColor: theme.accent }
            : styles.buttonDisabled,
          pressed && canIncrement && styles.buttonPressed,
        ]}
      >
        <Text style={[styles.buttonText, canIncrement ? styles.buttonTextEnabled : styles.buttonTextDisabled]}>+</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.disabled,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: FONT_SIZE.h2,
    fontWeight: FONT_WEIGHT.bold,
  },
  buttonTextEnabled: {
    color: COLORS.white,
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
