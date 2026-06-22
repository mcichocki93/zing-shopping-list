import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PixelInput, PixelButton, PixelTabs, QuantityStepper } from '../../../components/ui';
import { UNITS, DECIMAL_UNITS, COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE, FONT_WEIGHT } from '../../../constants';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSpeechInput } from '../hooks/useSpeechInput';
import { useCategories } from '../../categories';
import type { Unit } from '../../../constants';
import { ComposeBar } from '../../../components/ui-pixelpop';

const DEFAULT_CATEGORY = 'Inne';
const DEFAULT_UNIT: Unit = 'szt';
const TABS = ['RĘCZNIE', 'AI'];

export interface ManualItemData {
  name: string;
  quantity: number;
  unit?: string;
  category: string;
}

interface AIInputBarProps {
  onParse: (input: string) => void;
  onAddManual: (item: ManualItemData) => void;
  isParsing: boolean;
  disabled?: boolean;
  clearTrigger?: number;
}

export function AIInputBar({ onParse, onAddManual, isParsing, disabled = false, clearTrigger = 0 }: AIInputBarProps) {
  const { theme, pixelPopEnabled, pixelPopAccent } = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  // Manual tab state
  const [manualName, setManualName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState<Unit>(DEFAULT_UNIT);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(DEFAULT_CATEGORY);
  const { allCategories } = useCategories();
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // AI tab state
  const [aiText, setAiText] = useState('');
  const { isListening, transcript, error: speechError, isSupported: isSpeechSupported, startListening, stopListening, clearTranscript } = useSpeechInput();

  // Captures the text already in the field before a new dictation session starts
  const sessionBaseRef = useRef('');

  // Append live transcript to existing text (instead of replacing)
  useEffect(() => {
    if (!transcript) return;
    const base = sessionBaseRef.current.trim();
    setAiText(base ? base + ' ' + transcript : transcript);
  }, [transcript]);

  const handleMicPressIn = async () => {
    // Save current text as the base before this session adds to it
    sessionBaseRef.current = aiText;
    clearTranscript();
    await startListening();
  };

  useEffect(() => {
    if (clearTrigger > 0) {
      setManualName('');
      setQuantity(1);
      setSelectedUnit(DEFAULT_UNIT);
      setSelectedCategory(DEFAULT_CATEGORY);
      setShowCategoryPicker(false);
      setAiText('');
      clearTranscript();
    }
  }, [clearTrigger, clearTranscript]);

  const handleQuickAdd = () => {
    const trimmed = manualName.trim();
    if (!trimmed || isParsing) return;
    onAddManual({
      name: trimmed,
      quantity,
      unit: selectedUnit,
      category: selectedCategory,
    });
    setManualName('');
    setQuantity(1);
  };

  const handleAIParse = () => {
    const trimmed = aiText.trim();
    if (!trimmed || isParsing) return;
    onParse(trimmed);
  };

  if (pixelPopEnabled) {
    return (
      <ComposeBar
        mode={activeTab === 0 ? 1 : 0}
        onModeChange={(i) => setActiveTab(i === 0 ? 1 : 0)}
        value={aiText}
        onChangeText={(t) => { setAiText(t); if (!isListening) sessionBaseRef.current = t; }}
        onSend={() => {
          if (activeTab === 1) {
            const t = aiText.trim();
            if (!t || isParsing) return;
            onParse(t);
          }
        }}
        onMicPress={async () => { if (isListening) { stopListening(); } else { sessionBaseRef.current = aiText; clearTranscript(); await startListening(); } }}
        isListening={isListening}
        micDisabled={!isSpeechSupported}
        isParsing={isParsing}
        accent={pixelPopAccent}
        placeholder={isListening ? 'Słucham...' : '2x mleko, chleb, jabłka…'}
      />
    );
  }

  return (
    <View style={styles.container}>
      <PixelTabs tabs={TABS} activeIndex={activeTab} onChangeIndex={setActiveTab} />

      {activeTab === 0 ? (
        <View style={styles.tabContent}>
          <View style={styles.field}>
            <Text style={styles.label}>NAZWA:</Text>
            <PixelInput
              placeholder="Nazwa produktu"
              value={manualName}
              onChangeText={setManualName}
              editable={!isParsing && !disabled}
              accessibilityLabel="Nazwa produktu"
            />
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.fieldHalf}>
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
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>JEDNOSTKA:</Text>
              <Pressable
                onPress={() => setShowUnitPicker(true)}
                style={styles.categoryTrigger}
                accessibilityRole="button"
                accessibilityLabel={`Jednostka: ${selectedUnit}. Zmień jednostkę`}
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
              accessibilityLabel={`Kategoria: ${selectedCategory}. Zmień kategorię`}
            >
              <Text style={styles.categoryValue} numberOfLines={1}>{selectedCategory}</Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.disabled} />
            </Pressable>
          </View>

          <PixelButton
            title="+ DODAJ"
            onPress={handleQuickAdd}
            disabled={!manualName.trim() || isParsing || disabled}
            accessibilityLabel="Dodaj produkt"
          />
        </View>
      ) : (
        <View style={styles.tabContent}>
          <Text style={styles.aiHint}>
            Wpisz lub podyktuj listę produktów. AI rozpozna nazwy, ilości i kategorie.
          </Text>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>TEKST:</Text>
              <View style={styles.labelActions}>
                {aiText.length > 0 && (
                  <Pressable
                    onPress={() => { setAiText(''); sessionBaseRef.current = ''; clearTranscript(); }}
                    style={styles.clearBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Wyczyść tekst"
                  >
                    <MaterialCommunityIcons name="close-circle" size={18} color={COLORS.disabled} />
                  </Pressable>
                )}
                {isSpeechSupported && (
                  <Pressable
                    onPressIn={handleMicPressIn}
                    onPressOut={stopListening}
                    disabled={isParsing || disabled}
                    style={[styles.micBtn, isListening && { backgroundColor: COLORS.danger }]}
                    accessibilityRole="button"
                    accessibilityLabel="Przytrzymaj aby dyktować"
                  >
                    <MaterialCommunityIcons
                      name={isListening ? 'microphone' : 'microphone-outline'}
                      size={18}
                      color={isListening ? COLORS.white : COLORS.primary}
                    />
                  </Pressable>
                )}
              </View>
            </View>
            <PixelInput
              placeholder={isListening ? 'Słucham...' : 'np. 2x mleko, 3 jabłka, chleb...'}
              value={aiText}
              onChangeText={(t) => { setAiText(t); if (!isListening) sessionBaseRef.current = t; }}
              multiline
              numberOfLines={3}
              editable={!isParsing && !disabled && !isListening}
              accessibilityLabel="Tekst do rozpoznania AI"
            />
          </View>

          {speechError && <Text style={styles.speechError}>{speechError}</Text>}

          {isParsing ? (
            <View style={styles.loaderRow}>
              <ActivityIndicator size="small" color={theme.accent} accessibilityLabel="Przetwarzanie AI" />
              <Text style={styles.loaderText}>Rozpoznawanie...</Text>
            </View>
          ) : (
            <PixelButton
              title="ROZPOZNAJ AI"
              onPress={handleAIParse}
              disabled={!aiText.trim() || disabled || isListening}
              icon={<MaterialCommunityIcons name="auto-fix" size={18} color={COLORS.white} />}
              accessibilityLabel="Rozpoznaj produkty przez AI"
            />
          )}
        </View>
      )}

      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowCategoryPicker(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Wybierz kategorię</Text>
            {allCategories.map((cat) => {
              const isSelected = cat === selectedCategory;
              return (
                <Pressable
                  key={cat}
                  onPress={() => { setSelectedCategory(cat); setShowCategoryPicker(false); }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={cat}
                  style={[styles.modalOption, isSelected && { backgroundColor: theme.accent }]}
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

      <Modal
        visible={showUnitPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUnitPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowUnitPicker(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Wybierz jednostkę</Text>
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
                  accessibilityLabel={unit}
                  style={[styles.modalOption, isSelected && { backgroundColor: theme.accent }]}
                >
                  <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}>
                    {unit}
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
  tabContent: {
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  field: {
    gap: SPACING.xs,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  fieldHalf: {
    flex: 1,
    gap: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.disabled,
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  clearBtn: {
    width: TOUCH.minTarget,
    height: TOUCH.minTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtn: {
    width: TOUCH.minTarget,
    height: TOUCH.minTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  speechError: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.danger,
  },
  aiHint: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.disabled,
    lineHeight: FONT_SIZE.caption * 1.4,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    minHeight: TOUCH.minTarget,
  },
  loaderText: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.disabled,
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
