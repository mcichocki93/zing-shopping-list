import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { PixelCheckbox } from '../../../components/ui';
import { COLORS, SPACING, BORDERS, TOUCH } from '../../../constants';
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
        style={styles.checkbox}
      />
      <View style={styles.info}>
        <Text style={[styles.name, item.isCompleted && styles.nameCompleted]}>
          {item.name}
        </Text>
        <Text style={styles.quantity}>
          {item.quantity}{item.unit ? ` ${item.unit}` : ''}
        </Text>
      </View>
      <Pressable
        onPress={() => onRemove(item.id)}
        style={styles.removeBtn}
        hitSlop={8}
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
  checkbox: {
    minHeight: 0,
  },
  info: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  name: {
    fontSize: 16,
    color: COLORS.primary,
    flexShrink: 1,
  },
  nameCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.disabled,
  },
  quantity: {
    fontSize: 14,
    color: COLORS.disabled,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderWidth: BORDERS.width,
    borderColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.danger,
  },
});
