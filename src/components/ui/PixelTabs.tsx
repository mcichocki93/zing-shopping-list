import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE, FONT_WEIGHT } from '../../constants';
import { useTheme } from '../../contexts/ThemeContext';

interface PixelTabsProps {
  tabs: string[];
  activeIndex: number;
  onChangeIndex: (index: number) => void;
}

export function PixelTabs({ tabs, activeIndex, onChangeIndex }: PixelTabsProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const isActive = index === activeIndex;
        return (
          <Pressable
            key={tab}
            onPress={() => onChangeIndex(index)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab}
            style={[
              styles.tab,
              isActive
                ? { backgroundColor: theme.accent }
                : { backgroundColor: COLORS.background },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                isActive ? styles.tabTextActive : styles.tabTextInactive,
              ]}
            >
              {tab}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    borderRadius: BORDERS.radius,
  },
  tab: {
    flex: 1,
    minHeight: TOUCH.minTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  tabText: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.bold,
    textTransform: 'uppercase',
  },
  tabTextActive: {
    color: COLORS.white,
  },
  tabTextInactive: {
    color: COLORS.primary,
  },
});
