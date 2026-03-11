import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PixelModal, PixelInput, PixelButton, QuantityStepper } from '../../../components/ui';
import { CATEGORIES, UNITS, DECIMAL_UNITS, COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE, FONT_WEIGHT } from '../../../constants';
import { useTheme } from '../../../contexts/ThemeContext';
import type { Category, Unit } from '../../../constants';
import type { ShoppingItem } from '../../../types/shoppingList';

interface EditItemModalProps {
  visible: boolean;
  item: ShoppingItem | null;
  onSave: (itemId: string, updates: { name: string; quantity: number; unit?: string; category: string }) => void;
  onClose: () => void;
}

export function EditItemModal({ visible, item, onSave, onClose }: EditItemModalProps) {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState<Unit>('szt');
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('Inne');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setQuantity(item.quantity);
      setSelectedUnit((item.unit as Unit) || 'szt');
      setSelectedCategory((item.category as Category) || 'Inne');
    }
  }, [item]);

  const handleSave = () => {
    if (!item || !name.trim()) return;
    onSave(item.id, {
      name: name.trim(),
      quantity,
      unit: selectedUnit,
      category: selectedCategory,
    });
    onClose();
  };

  return (
    <PixelModal visible={visible} onClose={onClose} title="Edytuj produkt">
      <View style={styles.field}>
        <Text style={styles.label}>NAZWA:</Text>
        <PixelInput
          value={name}
          onChangeText={setName}
          placeholder="Nazwa produktu"
          accessibilityLabel="Nazwa produktu"
        />
      </View>

      <View style={styles.row}>
        <View style={styles.rowHalf}>
          <Text style={styles.label}>ILOŚĆ:</Text>
          <QuantityStepper
            value={quantity}
            onChange={setQuantity}
            min={DECIMAL_UNITS.has(selectedUnit) ? 0.1 : 1}
            max={999}
            step={DECIMAL_UNITS.has(selectedUnit) ? 0.5 : 1}
            accessibilityLabel="Ilość"
          />
        </View>
        <View style={styles.rowHalf}>
          <Text style={styles.label}>JEDNOSTKA:</Text>
          <Pressable
            onPress={() => setShowUnitPicker(true)}
            style={styles.categoryTrigger}
            accessibilityRole="button"
            accessibilityLabel={`Jednostka: ${selectedUnit}`}
          >
            <Text style={styles.categoryValue}>{selectedUnit}</Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.disabled} />
          </Pressable>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>KATEGORIA:</Text>
        <Pressable
          onPress={() => setShowCategoryPicker(true)}
          style={styles.categoryTrigger}
          accessibilityRole="button"
          accessibilityLabel={`Kategoria: ${selectedCategory}`}
        >
          <Text style={styles.categoryValue}>{selectedCategory}</Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.disabled} />
        </Pressable>
      </View>

      <View style={styles.buttons}>
        <PixelButton title="Zapisz" onPress={handleSave} disabled={!name.trim()} style={styles.btn} />
        <PixelButton title="Anuluj" onPress={onClose} variant="accentMuted" style={styles.btn} />
      </View>

      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <Pressable style={styles.pickerOverlay} onPress={() => setShowCategoryPicker(false)}>
          <View style={styles.pickerContent}>
            <Text style={styles.pickerTitle}>Wybierz kategorię</Text>
            {CATEGORIES.map((cat) => {
              const isSelected = cat === selectedCategory;
              return (
                <Pressable
                  key={cat}
                  onPress={() => { setSelectedCategory(cat); setShowCategoryPicker(false); }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  style={[styles.pickerOption, isSelected && { backgroundColor: theme.accent }]}
                >
                  <Text style={[styles.pickerOptionText, isSelected && styles.pickerOptionTextSelected]}>
                    {cat}
                  </Text>
                  {isSelected && <Text style={styles.pickerCheck}>{'✓'}</Text>}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={showUnitPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUnitPicker(false)}
      >
        <Pressable style={styles.pickerOverlay} onPress={() => setShowUnitPicker(false)}>
          <View style={styles.pickerContent}>
            <Text style={styles.pickerTitle}>Wybierz jednostkę</Text>
            {UNITS.map((unit) => {
              const isSelected = unit === selectedUnit;
              return (
                <Pressable
                  key={unit}
                  onPress={() => {
                    setSelectedUnit(unit);
                    if (!DECIMAL_UNITS.has(unit) && quantity % 1 !== 0) {
                      setQuantity(Math.round(quantity));
                    }
                    setShowUnitPicker(false);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  style={[styles.pickerOption, isSelected && { backgroundColor: theme.accent }]}
                >
                  <Text style={[styles.pickerOptionText, isSelected && styles.pickerOptionTextSelected]}>
                    {unit}
                  </Text>
                  {isSelected && <Text style={styles.pickerCheck}>{'✓'}</Text>}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </PixelModal>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  rowHalf: {
    flex: 1,
    gap: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.disabled,
    marginBottom: SPACING.xs,
  },
  categoryTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH.minTarget,
    paddingHorizontal: SPACING.sm,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  categoryValue: {
    flex: 1,
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  buttons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  btn: {
    flex: 1,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  pickerContent: {
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm,
  },
  pickerTitle: {
    fontSize: FONT_SIZE.h3,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: BORDERS.width,
    borderBottomColor: COLORS.border,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH.minTarget,
    paddingHorizontal: SPACING.md,
  },
  pickerOptionText: {
    flex: 1,
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  pickerOptionTextSelected: {
    color: COLORS.white,
  },
  pickerCheck: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
});
