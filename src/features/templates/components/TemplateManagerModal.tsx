import React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PixelModal, PixelButton } from '../../../components/ui';
import { COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE, FONT_WEIGHT } from '../../../constants';
import { useTemplates } from '../hooks/useTemplates';
import { usePremium } from '../../premium/hooks/usePremium';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function TemplateManagerModal({ visible, onClose }: Props) {
  const { isPremium } = usePremium();
  const { templates, isLoading, handleDelete } = useTemplates();

  const onDelete = (id: string, name: string) => {
    Alert.alert(
      'Usuń szablon',
      `Usunąć "${name}"?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Usuń', style: 'destructive', onPress: () => handleDelete(id) },
      ],
    );
  };

  return (
    <PixelModal visible={visible} onClose={onClose} title="Szablony list">
      {!isPremium && (
        <View style={styles.premiumBanner}>
          <MaterialCommunityIcons name="lock-outline" size={16} color={COLORS.disabled} />
          <Text style={styles.premiumText}>Szablony list — tylko dla Premium</Text>
        </View>
      )}

      {isPremium && (
        <>
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
          ) : templates.length === 0 ? (
            <Text style={styles.emptyText}>Brak szablonów. Zapisz listę jako szablon z ekranu listy.</Text>
          ) : (
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
              {templates.map((t) => (
                <View key={t.id} style={styles.row}>
                  <MaterialCommunityIcons name="file-outline" size={20} color={COLORS.primary} />
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowName}>{t.name}</Text>
                    <Text style={styles.rowMeta}>{t.items.length} produktów</Text>
                  </View>
                  <Pressable
                    onPress={() => onDelete(t.id, t.name)}
                    style={styles.deleteBtn}
                    accessibilityLabel={`Usuń szablon ${t.name}`}
                    accessibilityRole="button"
                    hitSlop={8}
                  >
                    <MaterialCommunityIcons name="delete-outline" size={20} color={COLORS.danger} />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          )}
        </>
      )}

      <PixelButton title="Zamknij" onPress={onClose} variant="accentMuted" style={styles.closeBtn} />
    </PixelModal>
  );
}

const styles = StyleSheet.create({
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
  },
  premiumText: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.disabled,
  },
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
    paddingVertical: SPACING.xs,
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
  deleteBtn: {
    padding: SPACING.xs,
    minWidth: TOUCH.minTarget / 2,
    alignItems: 'center',
  },
  closeBtn: {
    marginTop: SPACING.sm,
  },
});
