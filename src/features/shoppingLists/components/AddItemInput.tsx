import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { PixelInput, PixelButton } from '../../../components/ui';
import { COLORS, SPACING, BORDERS } from '../../../constants';

interface AddItemInputProps {
  onAdd: (name: string) => void;
  disabled?: boolean;
}

export function AddItemInput({ onAdd, disabled = false }: AddItemInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  };

  return (
    <View style={styles.container}>
      <PixelInput
        placeholder="Dodaj produkt..."
        value={text}
        onChangeText={setText}
        onSubmitEditing={handleSubmit}
        returnKeyType="done"
        style={styles.input}
        editable={!disabled}
      />
      <PixelButton
        title="+"
        onPress={handleSubmit}
        disabled={disabled || !text.trim()}
        style={styles.button}
      />
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
  },
  input: {
    flex: 1,
  },
  button: {
    width: 48,
    paddingHorizontal: 0,
  },
});
