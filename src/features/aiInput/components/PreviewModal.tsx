import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { categoryLabel, unitLabel } from '../../../constants/categoryLabels';
import { PixelButton, PixelCard } from '../../../components/ui';
import { COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE, FONT_WEIGHT } from '../../../constants';
import type { AIParsedItem } from '../../../types/ai';

interface PreviewModalProps {
  visible: boolean;
  items: AIParsedItem[];
  onConfirm: () => void;
  onCancel: () => void;
  onRemoveItem: (index: number) => void;
}

export function PreviewModal({
  visible,
  items,
  onConfirm,
  onCancel,
  onRemoveItem,
}: PreviewModalProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { paddingBottom: insets.bottom + SPACING.md }]}>
          <Text style={styles.title}>{t('preview.title')}</Text>
          <Text style={styles.subtitle}>
            {t('preview.recognized', { count: items.length })}
          </Text>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {items.map((item, index) => (
              <PixelCard key={`${item.name}-${index}`} style={styles.itemCard}>
                <View style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemMeta}>
                      {item.quantity} {unitLabel(item.unit ?? 'szt')} · {categoryLabel(item.category)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => onRemoveItem(index)}
                    style={styles.removeBtn}
                    accessibilityRole="button"
                    accessibilityLabel={`Usuń ${item.name}`}
                  >
                    <Text style={styles.removeText}>X</Text>
                  </Pressable>
                </View>
              </PixelCard>
            ))}
          </ScrollView>

          <View style={styles.actions}>
            <PixelButton
              title={t('common.cancel')}
              onPress={onCancel}
              variant="primary"
              style={styles.actionBtn}
            />
            <PixelButton
              title={t('preview.addCount', { count: items.length })}
              onPress={onConfirm}
              disabled={items.length === 0}
              style={styles.actionBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    maxHeight: '80%',
    backgroundColor: COLORS.background,
    borderTopWidth: BORDERS.width,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.h2,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.disabled,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  scroll: {
    maxHeight: 300,
  },
  scrollContent: {
    gap: SPACING.sm,
  },
  itemCard: {
    padding: SPACING.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    flexShrink: 1,
  },
  itemName: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  itemMeta: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.disabled,
    marginTop: SPACING.xs,
  },
  removeBtn: {
    minWidth: TOUCH.minTarget,
    minHeight: TOUCH.minTarget,
    borderWidth: BORDERS.width,
    borderColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.danger,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  actionBtn: {
    flex: 1,
  },
});
