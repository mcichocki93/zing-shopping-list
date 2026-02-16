import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { PixelCheckbox } from '../../../components/ui';
import { COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE, FONT_WEIGHT } from '../../../constants';
import type { ShoppingItem } from '../../../types/shoppingList';

interface ShoppingItemRowProps {
  item: ShoppingItem;
  onToggle: (itemId: string) => void;
  onRemove: (itemId: string) => void;
}

export function ShoppingItemRow({ item, onToggle, onRemove }: ShoppingItemRowProps) {
  return (
    <View style={styles.row}>
      <PixelCheckbox
        checked={item.isCompleted}
        onToggle={() => onToggle(item.id)}
        accessibilityLabel={item.isCompleted ? `${item.name}, kupione` : `${item.name}, do kupienia`}
        style={styles.checkbox}
      />
      <View style={styles.info}>
        <Text style={[styles.name, item.isCompleted && styles.nameCompleted]}>
          {item.name}
        </Text>
        <Text style={styles.quantity}>
          {item.quantity}{item.unit ? ` ${item.unit}` : ' szt'}
        </Text>
      </View>
      <Pressable
        onPress={() => onRemove(item.id)}
        style={styles.removeBtn}
        accessibilityRole="button"
        accessibilityLabel={`Usuń ${item.name}`}
      >
        <Text style={styles.removeText}>X</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH.minTarget,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  checkbox: {},
  info: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  name: {
    fontSize: FONT_SIZE.body,
    color: COLORS.primary,
    flexShrink: 1,
  },
  nameCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.disabled,
  },
  quantity: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.disabled,
  },
  removeBtn: {
    minWidth: TOUCH.minTarget,
    minHeight: TOUCH.minTarget,
    borderWidth: BORDERS.width,
    borderColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.danger,
  },
});
