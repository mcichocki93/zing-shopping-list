import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PixelCheckbox } from '../../../components/ui';
import { COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE, FONT_WEIGHT } from '../../../constants';
import { useTheme } from '../../../contexts/ThemeContext';
import type { ShoppingItem } from '../../../types/shoppingList';

interface ShoppingItemRowProps {
  item: ShoppingItem;
  onToggle: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onEdit?: (itemId: string) => void;
}

export function ShoppingItemRow({ item, onToggle, onRemove, onEdit }: ShoppingItemRowProps) {
  const { theme } = useTheme();

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
          SZTUKI: {item.quantity}{item.unit ? ` ${item.unit}` : ''}
        </Text>
      </View>
      <View style={styles.actions}>
        {onEdit && (
          <Pressable
            onPress={() => onEdit(item.id)}
            style={[styles.actionBtn, { borderColor: theme.accent }]}
            accessibilityRole="button"
            accessibilityLabel={`Edytuj ${item.name}`}
          >
            <MaterialCommunityIcons name="pencil-outline" size={18} color={theme.accent} />
          </Pressable>
        )}
        <Pressable
          onPress={() => onRemove(item.id)}
          style={[styles.actionBtn, styles.removeBtn]}
          accessibilityRole="button"
          accessibilityLabel={`Usuń ${item.name}`}
        >
          <MaterialCommunityIcons name="delete-outline" size={18} color={COLORS.danger} />
        </Pressable>
      </View>
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
    borderBottomWidth: BORDERS.width,
    borderBottomColor: COLORS.background,
  },
  checkbox: {},
  info: {
    flex: 1,
    marginLeft: SPACING.xs,
  },
  name: {
    fontSize: FONT_SIZE.body,
    color: COLORS.primary,
  },
  nameCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.disabled,
  },
  quantity: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.disabled,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderWidth: BORDERS.width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtn: {
    borderColor: COLORS.danger,
  },
});
