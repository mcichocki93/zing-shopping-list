import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { PixelInput, PixelButton } from '../../../components/ui';
import { COLORS, SPACING, BORDERS } from '../../../constants';

interface AIInputBarProps {
  onParse: (input: string) => void;
  onAddManual: (name: string) => void;
  isParsing: boolean;
  disabled?: boolean;
  clearTrigger?: number;
}

export function AIInputBar({ onParse, onAddManual, isParsing, disabled = false, clearTrigger = 0 }: AIInputBarProps) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (clearTrigger > 0) setText('');
  }, [clearTrigger]);

  const handleAIParse = () => {
    const trimmed = text.trim();
    if (!trimmed || isParsing) return;
    onParse(trimmed);
  };

  const handleQuickAdd = () => {
    const trimmed = text.trim();
    if (!trimmed || isParsing) return;
    onAddManual(trimmed);
    setText('');
  };

  const canSubmit = text.trim().length > 0 && !isParsing && !disabled;

  return (
    <View style={styles.container}>
      <PixelInput
        placeholder="Wpisz produkty, np. 2kg jabłek, mleko, chleb..."
        value={text}
        onChangeText={setText}
        multiline
        numberOfLines={2}
        style={styles.input}
        editable={!isParsing && !disabled}
        returnKeyType="default"
        accessibilityLabel="Produkty do dodania przez AI"
        accessibilityHint="Wpisz wiele produktów oddzielonych przecinkami"
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
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: BORDERS.width,
    borderBottomColor: COLORS.border,
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
    width: 48,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 44,
    paddingHorizontal: 0,
  },
  aiBtn: {
    width: 48,
    paddingHorizontal: 0,
  },
});
