import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, type TextInputProps, type ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE, FONT_WEIGHT } from '../../constants';
import { useTheme } from '../../contexts/ThemeContext';

interface PixelInputProps extends TextInputProps {
  style?: ViewStyle;
  label?: string;
  leftIcon?: React.ReactNode;
}

export function PixelInput({ style, label, leftIcon, ...props }: PixelInputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = isFocused ? theme.accent : COLORS.border;

  return (
    <View style={style}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, { borderColor }]}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <TextInput
          placeholderTextColor={COLORS.disabled}
          {...props}
          style={[styles.input, leftIcon ? styles.inputWithIcon : undefined]}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH.minTarget,
    borderWidth: BORDERS.width,
    borderRadius: BORDERS.radius,
    backgroundColor: COLORS.white,
  },
  iconContainer: {
    paddingLeft: SPACING.sm,
  },
  input: {
    flex: 1,
    minHeight: TOUCH.minTarget,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    color: COLORS.primary,
    fontSize: FONT_SIZE.body,
  },
  inputWithIcon: {
    paddingLeft: SPACING.xs,
  },
});
