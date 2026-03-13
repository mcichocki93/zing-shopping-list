import React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PixelModal, PixelButton } from '../../../components/ui';
import { COLORS, SPACING, BORDERS, FONT_SIZE, FONT_WEIGHT } from '../../../constants';
import type { ListTemplate } from '../../../types/template';

interface Props {
  visible: boolean;
  templates: ListTemplate[];
  isLoading: boolean;
  onSelect: (template: ListTemplate) => void;
  onClose: () => void;
}

export function TemplatePickerModal({ visible, templates, isLoading, onSelect, onClose }: Props) {
  return (
    <PixelModal visible={visible} onClose={onClose} title="Wybierz szablon">
      {isLoading ? (
        <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
      ) : templates.length === 0 ? (
        <Text style={styles.emptyText}>Brak szablonów. Zapisz listę jako szablon z ekranu listy.</Text>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {templates.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => { onSelect(t); onClose(); }}
              style={styles.row}
              accessibilityRole="button"
              accessibilityLabel={`Utwórz listę z szablonu ${t.name}`}
            >
              <MaterialCommunityIcons name="file-outline" size={20} color={COLORS.primary} />
              <View style={styles.rowInfo}>
                <Text style={styles.rowName}>{t.name}</Text>
                <Text style={styles.rowMeta}>{t.items.length} produktów</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.disabled} />
            </Pressable>
          ))}
        </ScrollView>
      )}

      <PixelButton title="Anuluj" onPress={onClose} variant="accentMuted" style={styles.cancelBtn} />
    </PixelModal>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginVertical: SPACING.md,
  },
  scroll: {
    maxHeight: 380,
  },
  emptyText: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.disabled,
    paddingVertical: SPACING.sm,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    borderBottomWidth: BORDERS.width,
    borderBottomColor: COLORS.border,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  rowMeta: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.disabled,
    marginTop: 2,
  },
  cancelBtn: {
    marginTop: SPACING.sm,
  },
});
