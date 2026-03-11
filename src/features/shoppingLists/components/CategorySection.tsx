import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ShoppingItemRow } from './ShoppingItemRow';
import { COLORS, SPACING, BORDERS, FONT_SIZE, FONT_WEIGHT, getCategoryColor } from '../../../constants';
import type { ShoppingItem } from '../../../types/shoppingList';

interface CategorySectionProps {
  category: string;
  items: ShoppingItem[];
  onToggle: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onEdit?: (itemId: string) => void;
  drag?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export const CategorySection = memo(function CategorySection({
  category,
  items,
  onToggle,
  onRemove,
  onEdit,
  drag,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
}: CategorySectionProps) {
  const showArrows = !drag && (onMoveUp != null || onMoveDown != null);
  const isKupione = category === 'Kupione';
  const headerColor = isKupione ? COLORS.disabled : getCategoryColor(category);

  return (
    <View style={styles.section}>
      <Pressable
        onLongPress={drag}
        delayLongPress={150}
        style={[styles.header, { backgroundColor: headerColor }]}
        accessibilityRole="header"
        accessibilityLabel={`${category}, ${items.length} produktów${drag ? '. Przytrzymaj aby zmienić kolejność' : ''}`}
      >
        {!isKupione && (
          <Text style={styles.grip}>{'≡'}</Text>
        )}
        <Text style={styles.title}>{category}</Text>
        <View style={styles.headerRight}>
          {showArrows && (
            <View style={styles.moveControls}>
              <Pressable
                onPress={onMoveUp}
                disabled={isFirst}
                accessibilityRole="button"
                accessibilityLabel={`Przenieś ${category} w górę`}
                accessibilityState={{ disabled: isFirst }}
                style={[styles.moveBtn, isFirst && styles.moveBtnDisabled]}
              >
                <Text style={[styles.moveBtnText, isFirst && styles.moveBtnTextDisabled]}>{'‹'}</Text>
              </Pressable>
              <Pressable
                onPress={onMoveDown}
                disabled={isLast}
                accessibilityRole="button"
                accessibilityLabel={`Przenieś ${category} w dół`}
                accessibilityState={{ disabled: isLast }}
                style={[styles.moveBtn, isLast && styles.moveBtnDisabled]}
              >
                <Text style={[styles.moveBtnText, isLast && styles.moveBtnTextDisabled]}>{'›'}</Text>
              </Pressable>
            </View>
          )}
          <Text style={styles.count}>{items.length}</Text>
        </View>
      </Pressable>
      {items.map((item) => (
        <ShoppingItemRow
          key={item.id}
          item={item}
          onToggle={onToggle}
          onRemove={onRemove}
          onEdit={onEdit}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  section: {
    marginBottom: SPACING.sm,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    gap: SPACING.xs,
  },
  grip: {
    fontSize: FONT_SIZE.h3,
    color: 'rgba(0, 0, 0, 0.3)',
    lineHeight: FONT_SIZE.h3,
  },
  title: {
    flex: 1,
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  moveControls: {
    flexDirection: 'row',
    gap: 2,
  },
  moveBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
  },
  moveBtnDisabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  moveBtnText: {
    fontSize: FONT_SIZE.h2,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    lineHeight: FONT_SIZE.h2,
    transform: [{ rotate: '-90deg' }],
  },
  moveBtnTextDisabled: {
    color: 'rgba(0, 0, 0, 0.2)',
  },
  count: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.primary,
    minWidth: 20,
    textAlign: 'right',
  },
});
