import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { PixelInput, PixelButton } from '../../../components/ui';
import { CATEGORIES, COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE, FONT_WEIGHT } from '../../../constants';
import type { Category } from '../../../constants';

const DEFAULT_CATEGORY: Category = 'Inne';
const UNITS = ['szt', 'kg', 'g', 'l', 'ml', 'opak'] as const;

export interface ManualItemData {
  name: string;
  quantity: number;
  unit?: string;
  category: Category;
}

interface AIInputBarProps {
  onParse: (input: string) => void;
  onAddManual: (item: ManualItemData) => void;
  isParsing: boolean;
  disabled?: boolean;
  clearTrigger?: number;
}

export function AIInputBar({ onParse, onAddManual, isParsing, disabled = false, clearTrigger = 0 }: AIInputBarProps) {
  const [text, setText] = useState('');
  const [qtyText, setQtyText] = useState('1');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>(DEFAULT_CATEGORY);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    if (clearTrigger > 0) {
      setText('');
      setQtyText('1');
      setSelectedUnit(null);
      setSelectedCategory(DEFAULT_CATEGORY);
      setShowCategoryPicker(false);
      setQtyError('');
    }
  }, [clearTrigger]);

  const [qtyError, setQtyError] = useState('');

  const parseQuantity = (): number | null => {
    const n = parseFloat(qtyText.replace(',', '.'));
    if (Number.isNaN(n) || n <= 0) return null;
    if (n > 9999) return null;
    return n;
  };

  const handleAIParse = () => {
    const trimmed = text.trim();
    if (!trimmed || isParsing) return;
    setQtyError('');
    onParse(trimmed);
  };

  const handleQuickAdd = () => {
    const trimmed = text.trim();
    if (!trimmed || isParsing) return;
    const qty = parseQuantity();
    if (qty === null) {
      setQtyError('Podaj liczbę > 0');
      return;
    }
    setQtyError('');
    onAddManual({
      name: trimmed,
      quantity: qty,
      unit: selectedUnit ?? undefined,
      category: selectedCategory,
    });
    setText('');
    setQtyText('1');
    setSelectedUnit(null);
  };

  const toggleUnit = (unit: string) => {
    setSelectedUnit((prev) => (prev === unit ? null : unit));
  };

  const canSubmit = text.trim().length > 0 && !isParsing && !disabled;

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <PixelInput
          placeholder="Wpisz produkty, np. jabłka, mleko, chleb..."
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={2}
          style={styles.input}
          editable={!isParsing && !disabled}
          returnKeyType="default"
          accessibilityLabel="Nazwa produktu"
          accessibilityHint="Wpisz produkt i wybierz ilość, jednostkę i kategorię"
        />
        <View style={styles.actions}>
          {isParsing ? (
            <View style={styles.loader}>
              <ActivityIndicator size="small" color={COLORS.accent} accessibilityLabel="Przetwarzanie AI" />
            </View>
          ) : (
            <>
              <PixelButton
                title="+"
                onPress={handleQuickAdd}
                disabled={!canSubmit}
                accessibilityLabel="Dodaj produkt"
                style={styles.addBtn}
              />
              <PixelButton
                title="AI"
                onPress={handleAIParse}
                disabled={!canSubmit}
                accessibilityLabel="Dodaj produkty przez AI"
                style={styles.aiBtn}
              />
            </>
          )}
        </View>
      </View>

      <View style={styles.qtyRow}>
        <PixelInput
          value={qtyText}
          onChangeText={(v) => { setQtyText(v); if (qtyError) setQtyError(''); }}
          keyboardType="decimal-pad"
          selectTextOnFocus
          style={{ ...styles.qtyInput, ...(qtyError ? styles.qtyInputError : undefined) }}
          editable={!isParsing && !disabled}
          accessibilityLabel="Ilość"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.unitChips}
          accessibilityLabel="Jednostka"
        >
          {UNITS.map((unit) => {
            const isSelected = unit === selectedUnit;
            return (
              <Pressable
                key={unit}
                onPress={() => toggleUnit(unit)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={unit}
                style={[styles.chip, isSelected && styles.chipSelected]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {unit}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {qtyError !== '' && (
        <Text style={styles.qtyError} accessibilityLiveRegion="polite">{qtyError}</Text>
      )}

      <View style={styles.categoryRow}>
        <Pressable
          onPress={() => setShowCategoryPicker(true)}
          style={styles.categoryTrigger}
          accessibilityRole="button"
          accessibilityLabel={`Kategoria: ${selectedCategory}. Zmień kategorię`}
        >
          <Text style={styles.categoryLabel}>Kategoria:</Text>
          <Text style={styles.categoryValue} numberOfLines={1}>{selectedCategory}</Text>
          <Text style={styles.categoryArrow}>{'▼'}</Text>
        </Pressable>
      </View>

      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowCategoryPicker(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Wybierz kategorię</Text>
            {CATEGORIES.map((cat) => {
              const isSelected = cat === selectedCategory;
              return (
                <Pressable
                  key={cat}
                  onPress={() => { setSelectedCategory(cat); setShowCategoryPicker(false); }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={cat}
                  style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                >
                  <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}>
                    {cat}
                  </Text>
                  {isSelected && <Text style={styles.modalCheck}>{'✓'}</Text>}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderBottomWidth: BORDERS.width,
    borderBottomColor: COLORS.border,
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.sm,
    paddingBottom: SPACING.sm,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  loader: {
    width: TOUCH.minTarget,
    height: TOUCH.minTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: TOUCH.minTarget,
    paddingHorizontal: 0,
  },
  aiBtn: {
    width: TOUCH.minTarget,
    paddingHorizontal: 0,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  qtyInput: {
    width: 56,
    minHeight: TOUCH.minTarget,
    paddingVertical: SPACING.xs,
    textAlign: 'center',
  },
  qtyInputError: {
    borderColor: COLORS.danger,
  },
  qtyError: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.danger,
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  unitChips: {
    gap: SPACING.xs,
    alignItems: 'center',
  },
  chip: {
    minHeight: TOUCH.minTarget,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  chipText: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  chipTextSelected: {
    color: COLORS.white,
  },
  categoryRow: {
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.sm,
    paddingTop: SPACING.xs,
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
  categoryLabel: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.disabled,
    marginRight: SPACING.xs,
  },
  categoryValue: {
    flex: 1,
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  categoryArrow: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.disabled,
    marginLeft: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm,
  },
  modalTitle: {
    fontSize: FONT_SIZE.h3,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: BORDERS.width,
    borderBottomColor: COLORS.border,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH.minTarget,
    paddingHorizontal: SPACING.md,
  },
  modalOptionSelected: {
    backgroundColor: COLORS.accent,
  },
  modalOptionText: {
    flex: 1,
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  modalOptionTextSelected: {
    color: COLORS.white,
  },
  modalCheck: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
});
