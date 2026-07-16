// SearchField.tsx — pole wyszukiwania (placeholder/edytowalne). Skopiuj do: src/components/ui-pixelpop/SearchField.tsx

import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PP, PP_BORDER, PP_FONT } from '../../constants/pixelPopTheme';
import { PixelIcon } from './PixelIcon';

interface SearchFieldProps {
  value?: string;
  onChangeText?: (t: string) => void;
  placeholder?: string;
}

export function SearchField({ value, onChangeText, placeholder }: SearchFieldProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <PixelIcon name="search" size={14} color={PP.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? t('dashboard.search')}
        placeholderTextColor={PP.muted}
        style={styles.input}
        accessibilityLabel={t('common.search')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: PP.panel, borderWidth: PP_BORDER.thin, borderColor: PP.ink,
    paddingHorizontal: 12, minHeight: 44,
  },
  input: { flex: 1, fontFamily: PP_FONT.ui, fontSize: 13, color: PP.ink, paddingVertical: 0 },
});

export default SearchField;
