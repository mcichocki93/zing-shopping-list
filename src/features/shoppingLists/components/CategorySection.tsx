import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShoppingItemRow } from './ShoppingItemRow';
import { COLORS, SPACING, BORDERS, FONT_SIZE, FONT_WEIGHT } from '../../../constants';
import type { ShoppingItem } from '../../../types/shoppingList';

interface CategorySectionProps {
  category: string;
  items: ShoppingItem[];
  onToggle: (itemId: string) => void;
  onRemove: (itemId: string) => void;
}

export function CategorySection({ category, items, onToggle, onRemove }: CategorySectionProps) {
  return (
    <View style={styles.section}>
      <View
        style={styles.header}
        accessibilityRole="header"
        accessibilityLabel={`${category}, ${items.length} produktów`}
      >
        <Text style={styles.title}>{category}</Text>
        <Text style={styles.count}>{items.length}</Text>
      </View>
      {items.map((item) => (
        <ShoppingItemRow
          key={item.id}
          item={item}
          onToggle={onToggle}
          onRemove={onRemove}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: SPACING.sm,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  count: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.white,
  },
});
