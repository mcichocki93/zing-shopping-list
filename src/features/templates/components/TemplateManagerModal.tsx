import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PixelModal, PixelButton } from '../../../components/ui';
import { COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE, FONT_WEIGHT } from '../../../constants';
import { useTemplates } from '../hooks/useTemplates';
import { usePremium } from '../../premium/hooks/usePremium';
import { useTheme } from '../../../contexts/ThemeContext';
import { PP, PP_BORDER, PP_FONT, ppText } from '../../../constants/pixelPopTheme';
import { PPModal, PixelIcon } from '../../../components/ui-pixelpop';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function TemplateManagerModal({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const { isPremium } = usePremium();
  const { templates, isLoading, handleDelete, reload } = useTemplates();
  const { pixelPopEnabled, pixelPopAccent } = useTheme();

  useEffect(() => {
    if (visible) reload();
  }, [visible, reload]);

  const onDelete = (id: string, name: string) => {
    Alert.alert(
      t('templates.deleteTitle'),
      t('templates.deleteConfirm', { name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: () => handleDelete(id) },
      ],
    );
  };

  if (pixelPopEnabled) {
    return (
      <PPModal visible={visible} onClose={onClose} title={t('templates.modalTitle')}>
        {!isPremium && (
          <View style={pp.premiumBanner}>
            <PixelIcon name="star" size={14} color={PP.muted} />
            <Text style={pp.premiumText}>{t('templates.premiumOnly')}</Text>
          </View>
        )}

        {isPremium && (
          <>
            {isLoading ? (
              <ActivityIndicator size="small" color={pixelPopAccent} style={pp.loader} />
            ) : templates.length === 0 ? (
              <Text style={pp.emptyText}>{t('templates.empty')}</Text>
            ) : (
              <ScrollView style={pp.scroll} showsVerticalScrollIndicator={false}>
                {templates.map((tpl) => (
                  <View key={tpl.id} style={pp.row}>
                    <PixelIcon name="template" size={16} color={PP.ink} />
                    <View style={pp.rowInfo}>
                      <Text style={ppText.rowBody}>{tpl.name}</Text>
                      <Text style={ppText.meta}>{t('templates.items', { count: tpl.items.length })}</Text>
                    </View>
                    <Pressable
                      onPress={() => onDelete(tpl.id, tpl.name)}
                      style={pp.deleteBtn}
                      accessibilityLabel={t('templates.deleteA11y', { name: tpl.name })}
                      hitSlop={8}
                    >
                      <PixelIcon name="trash" size={14} color={PP.panel} />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            )}
          </>
        )}

        <Pressable onPress={onClose} style={pp.closeBtn} accessibilityLabel={t('common.close')}>
          <Text style={pp.closeBtnText}>{t('templates.close')}</Text>
        </Pressable>
      </PPModal>
    );
  }

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

// ─── Pixel Pop styles ────────────────────────────────────────────────────────

const pp = StyleSheet.create({
  premiumBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  premiumText: { fontFamily: PP_FONT.uiSemi, fontSize: 12, color: PP.muted },
  loader: { marginVertical: 16 },
  scroll: { maxHeight: 360 },
  emptyText: { fontFamily: PP_FONT.uiSemi, fontSize: 12, color: PP.muted, paddingVertical: 12, lineHeight: 20 },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    gap: 10, borderBottomWidth: PP_BORDER.thin, borderBottomColor: PP.ink + '33',
  },
  rowInfo: { flex: 1 },
  deleteBtn: {
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FF3B30', borderWidth: PP_BORDER.base, borderColor: PP.ink,
  },
  closeBtn: {
    marginTop: 14, alignItems: 'center', paddingVertical: 12,
    borderWidth: PP_BORDER.thick, borderColor: PP.ink, backgroundColor: PP.ink,
  },
  closeBtnText: { fontFamily: PP_FONT.display, fontSize: 9, color: PP.paper },
});

// ─── Legacy styles ───────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  premiumBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingVertical: SPACING.sm },
  premiumText: { fontSize: FONT_SIZE.caption, color: COLORS.disabled },
  loader: { marginVertical: SPACING.md },
  scroll: { maxHeight: 380 },
  emptyText: { fontSize: FONT_SIZE.caption, color: COLORS.disabled, paddingVertical: SPACING.sm, lineHeight: 20 },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.xs,
    gap: SPACING.sm, borderBottomWidth: BORDERS.width, borderBottomColor: COLORS.border,
  },
  rowInfo: { flex: 1 },
  rowName: { fontSize: FONT_SIZE.body, fontWeight: FONT_WEIGHT.bold, color: COLORS.primary },
  rowMeta: { fontSize: FONT_SIZE.caption, color: COLORS.disabled, marginTop: 2 },
  deleteBtn: { padding: SPACING.xs, minWidth: TOUCH.minTarget / 2, alignItems: 'center' },
  closeBtn: { marginTop: SPACING.sm },
});
