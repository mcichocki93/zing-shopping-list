import type { PropsWithChildren } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDERS } from '../../constants';

interface PixelCardProps extends PropsWithChildren {
  style?: ViewStyle;
}

export function PixelCard({ children, style }: PixelCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    padding: SPACING.md,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    borderRadius: BORDERS.radius,
    backgroundColor: COLORS.white,
  },
});
