import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PixelModal, PixelButton } from '../../../components/ui';
import { CATEGORIES, COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE, FONT_WEIGHT } from '../../../constants';
import { getCategoryColor } from '../../../constants';
import { categoryLabel } from '../../../constants/categoryLabels';
import { useCategories } from '../hooks/useCategories';
import { useTheme } from '../../../contexts/ThemeContext';
import { PP, PP_BORDER, PP_FONT, ppText } from '../../../constants/pixelPopTheme';
import { PPModal, PixelIcon } from '../../../components/ui-pixelpop';

// Color palette for custom categories
const PICKER_COLORS = [
  '#A5D6A7', '#90CAF9', '#FFCC80', '#F48FB1',
  '#80DEEA', '#CE93D8', '#FFAB91', '#FFD54F',
  '#E6EE9C', '#B3E5FC', '#FFCDD2', '#B0BEC5',
];

interface EditorState {
  mode: 'add' | 'edit';
  originalName: string;
  name: string;
  color: string;
}

interface CategoryManagerModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CategoryManagerModal({ visible, onClose }: CategoryManagerModalProps) {
  const { t } = useTranslation();
  const { customCategories, isPremium, addCategory, updateCategory, deleteCategory } = useCategories();
  const { pixelPopEnabled, pixelPopAccent } = useTheme();
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditor({ mode: 'add', originalName: '', name: '', color: PICKER_COLORS[0] });
  };

  const openEdit = (name: string, color: string) => {
    setEditor({ mode: 'edit', originalName: name, name, color });
  };

  const closeEditor = () => setEditor(null);

  const onSave = async () => {
    if (!editor) return;
    const trimmed = editor.name.trim();
    if (!trimmed) {
      Alert.alert(t('common.error'), t('categories.errEmpty'));
      return;
    }
    if (trimmed.length > 30) {
      Alert.alert(t('common.error'), t('categories.errTooLong'));
      return;
    }
    const allNames = [...CATEGORIES as readonly string[], ...customCategories.map((c) => c.name)];
    const isDuplicate = allNames.some(
      (n) => n.toLowerCase() === trimmed.toLowerCase() && n !== editor.originalName,
    );
    if (isDuplicate) {
      Alert.alert(t('common.error'), t('categories.errExists'));
      return;
    }
    setSaving(true);
    try {
      if (editor.mode === 'add') {
        await addCategory(trimmed, editor.color);
      } else {
        await updateCategory(editor.originalName, trimmed, editor.color);
      }
      setEditor(null);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = (name: string) => {
    Alert.alert(
      t('categories.deleteTitle'),
      t('categories.deleteConfirm', { name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try { await deleteCategory(name); } finally { setSaving(false); }
          },
        },
      ],
    );
  };

  if (pixelPopEnabled) {
    return (
      <PPModal visible={visible} onClose={onClose} title={t('categories.title')}>
        <ScrollView style={pp.scroll} showsVerticalScrollIndicator={false}>
          {/* Built-in */}
          <Text style={pp.sectionLabel}>{t('categories.builtin')}</Text>
          {CATEGORIES.map((cat) => (
            <View key={cat} style={pp.row}>
              <View style={[pp.colorSquare, { backgroundColor: getCategoryColor(cat) }]} />
              <Text style={ppText.rowBody}>{categoryLabel(cat)}</Text>
            </View>
          ))}

          {/* Custom */}
          <View style={pp.sectionHead}>
            <Text style={pp.sectionLabel}>{t('categories.custom')}</Text>
            {isPremium && customCategories.length < 20 && !editor && (
              <Pressable onPress={openAdd} style={[pp.addBtn, { backgroundColor: pixelPopAccent }]} accessibilityLabel={t('categories.addA11y')}>
                <Text style={pp.addBtnText}>{t('categories.add')}</Text>
              </Pressable>
            )}
          </View>

          {!isPremium && (
            <View style={pp.premiumBanner}>
              <PixelIcon name="star" size={14} color={PP.muted} />
              <Text style={pp.premiumText}>{t('categories.premiumOnly')}</Text>
            </View>
          )}

          {customCategories.length === 0 && isPremium && !editor && (
            <Text style={pp.emptyText}>{t('categories.empty')}</Text>
          )}

          {customCategories.map((cat) => (
            <View key={cat.name} style={pp.row}>
              <View style={[pp.colorSquare, { backgroundColor: cat.color }]} />
              <Text style={[ppText.rowBody, { flex: 1 }]}>{cat.name}</Text>
              {isPremium && (
                <View style={pp.actions}>
                  <Pressable onPress={() => openEdit(cat.name, cat.color)} style={pp.iconBtn} accessibilityLabel={t('categories.editA11y', { name: cat.name })}>
                    <PixelIcon name="edit" size={14} color={PP.ink} />
                  </Pressable>
                  <Pressable onPress={() => onDelete(cat.name)} style={[pp.iconBtn, { backgroundColor: '#FF3B30' }]} accessibilityLabel={t('categories.deleteA11y', { name: cat.name })}>
                    <PixelIcon name="trash" size={14} color={PP.panel} />
                  </Pressable>
                </View>
              )}
            </View>
          ))}

          {/* Inline editor */}
          {editor && (
            <View style={pp.editor}>
              <Text style={pp.editorTitle}>
                {editor.mode === 'add' ? t('categories.newCategory') : t('categories.editCategory')}
              </Text>
              <TextInput
                style={pp.input}
                value={editor.name}
                onChangeText={(val) => setEditor((prev) => prev ? { ...prev, name: val } : null)}
                placeholder={t('categories.namePlaceholder')}
                placeholderTextColor={PP.muted}
                maxLength={30}
                autoFocus
              />
              <Text style={[pp.sectionLabel, { marginTop: 12, marginBottom: 8 }]}>{t('categories.color')}</Text>
              <View style={pp.colorGrid}>
                {PICKER_COLORS.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => setEditor((prev) => prev ? { ...prev, color } : null)}
                    style={[
                      pp.colorSwatch,
                      { backgroundColor: color },
                      editor.color === color && pp.colorSwatchSelected,
                    ]}
                    accessibilityLabel={t('categories.colorA11y', { color })}
                  >
                    {editor.color === color && <Text style={pp.swatchCheck}>✓</Text>}
                  </Pressable>
                ))}
              </View>
              <View style={pp.editorBtns}>
                <Pressable
                  onPress={onSave}
                  disabled={saving}
                  style={[pp.editorBtn, { backgroundColor: pixelPopAccent, opacity: saving ? 0.6 : 1 }]}
                >
                  <Text style={pp.editorBtnText}>{saving ? t('categories.saving') : t('categories.save')}</Text>
                </Pressable>
                <Pressable onPress={closeEditor} style={[pp.editorBtn, { backgroundColor: PP.paper }]}>
                  <Text style={pp.editorBtnText}>{t('categories.cancel')}</Text>
                </Pressable>
              </View>
            </View>
          )}
        </ScrollView>

        <Pressable onPress={onClose} style={[pp.closeBtn, { backgroundColor: PP.ink }]} accessibilityLabel={t('common.close')}>
          <Text style={[pp.editorBtnText, { color: PP.paper }]}>{t('categories.close')}</Text>
        </Pressable>
      </PPModal>
    );
  }

  return (
    <PixelModal visible={visible} onClose={onClose} title="Kategorie">
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Built-in categories */}
        <Text style={styles.sectionLabel}>WBUDOWANE</Text>
        {CATEGORIES.map((cat) => (
          <View key={cat} style={styles.categoryRow}>
            <View style={[styles.colorDot, { backgroundColor: getCategoryColor(cat) }]} />
            <Text style={styles.categoryName}>{cat}</Text>
          </View>
        ))}

        {/* Custom categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>WŁASNE</Text>
          {isPremium && customCategories.length < 20 && !editor && (
            <Pressable onPress={openAdd} style={styles.addBtn} accessibilityLabel="Dodaj kategorię">
              <MaterialCommunityIcons name="plus" size={18} color={COLORS.white} />
              <Text style={styles.addBtnText}>Dodaj</Text>
            </Pressable>
          )}
        </View>

        {!isPremium && (
          <View style={styles.premiumBanner}>
            <MaterialCommunityIcons name="lock-outline" size={16} color={COLORS.disabled} />
            <Text style={styles.premiumText}>Własne kategorie — tylko dla Premium</Text>
          </View>
        )}

        {customCategories.length === 0 && isPremium && !editor && (
          <Text style={styles.emptyText}>Brak własnych kategorii. Dodaj pierwszą!</Text>
        )}

        {customCategories.map((cat) => (
          <View key={cat.name} style={styles.categoryRow}>
            <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
            <Text style={[styles.categoryName, styles.flex]}>{cat.name}</Text>
            {isPremium && (
              <View style={styles.actions}>
                <Pressable
                  onPress={() => openEdit(cat.name, cat.color)}
                  style={styles.iconBtn}
                  accessibilityLabel={`Edytuj ${cat.name}`}
                >
                  <MaterialCommunityIcons name="pencil-outline" size={18} color={COLORS.primary} />
                </Pressable>
                <Pressable
                  onPress={() => onDelete(cat.name)}
                  style={styles.iconBtn}
                  accessibilityLabel={`Usuń ${cat.name}`}
                >
                  <MaterialCommunityIcons name="delete-outline" size={18} color={COLORS.danger} />
                </Pressable>
              </View>
            )}
          </View>
        ))}

        {/* Inline editor */}
        {editor && (
          <View style={styles.editor}>
            <Text style={styles.editorTitle}>
              {editor.mode === 'add' ? 'Nowa kategoria' : 'Edytuj kategorię'}
            </Text>
            <TextInput
              style={styles.input}
              value={editor.name}
              onChangeText={(t) => setEditor((prev) => prev ? { ...prev, name: t } : null)}
              placeholder="Nazwa kategorii"
              maxLength={30}
              autoFocus
            />
            <Text style={styles.colorLabel}>Kolor:</Text>
            <View style={styles.colorGrid}>
              {PICKER_COLORS.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setEditor((prev) => prev ? { ...prev, color } : null)}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    editor.color === color && styles.colorSwatchSelected,
                  ]}
                  accessibilityLabel={`Kolor ${color}`}
                />
              ))}
            </View>
            <View style={styles.editorButtons}>
              <PixelButton
                title={saving ? 'Zapisuję...' : 'Zapisz'}
                onPress={onSave}
                disabled={saving}
                style={styles.editorBtn}
              />
              <PixelButton
                title="Anuluj"
                onPress={closeEditor}
                variant="accentMuted"
                style={styles.editorBtn}
              />
            </View>
          </View>
        )}
      </ScrollView>

      <PixelButton title="Zamknij" onPress={onClose} variant="accentMuted" style={styles.closeBtn} />
    </PixelModal>
  );
}

// ─── Pixel Pop styles ────────────────────────────────────────────────────────

const pp = StyleSheet.create({
  scroll: { maxHeight: 420 },
  sectionLabel: { fontFamily: PP_FONT.display, fontSize: 9, color: PP.muted, letterSpacing: 1, marginTop: 12, marginBottom: 6 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: PP_BORDER.thin, borderBottomColor: PP.ink + '33' },
  colorSquare: { width: 16, height: 16, borderWidth: PP_BORDER.base, borderColor: PP.ink },
  actions: { flexDirection: 'row', gap: 6 },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderWidth: PP_BORDER.base, borderColor: PP.ink, backgroundColor: PP.paper },
  addBtn: { paddingHorizontal: 10, paddingVertical: 5, borderWidth: PP_BORDER.base, borderColor: PP.ink },
  addBtnText: { fontFamily: PP_FONT.display, fontSize: 9, color: PP.ink },
  premiumBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10 },
  premiumText: { fontFamily: PP_FONT.uiSemi, fontSize: 12, color: PP.muted },
  emptyText: { fontFamily: PP_FONT.uiSemi, fontSize: 12, color: PP.muted, paddingVertical: 10 },
  editor: { marginTop: 14, paddingTop: 14, borderTopWidth: PP_BORDER.thin, borderTopColor: PP.ink },
  editorTitle: { fontFamily: PP_FONT.display, fontSize: 9, color: PP.ink, letterSpacing: 1, marginBottom: 10 },
  input: {
    backgroundColor: PP.paper, borderWidth: PP_BORDER.base, borderColor: PP.ink,
    paddingHorizontal: 12, paddingVertical: 10, fontFamily: PP_FONT.ui, fontSize: 13, color: PP.ink,
  },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  colorSwatch: { width: 28, height: 28, borderWidth: PP_BORDER.base, borderColor: PP.ink, alignItems: 'center', justifyContent: 'center' },
  colorSwatchSelected: { borderWidth: PP_BORDER.thick + 1, borderColor: PP.ink },
  swatchCheck: { fontFamily: PP_FONT.uiBold, fontSize: 14, color: PP.ink },
  editorBtns: { flexDirection: 'row', gap: 8, marginTop: 12 },
  editorBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderWidth: PP_BORDER.thick, borderColor: PP.ink },
  editorBtnText: { fontFamily: PP_FONT.display, fontSize: 9, color: PP.ink },
  closeBtn: { marginTop: 14, alignItems: 'center', paddingVertical: 12, borderWidth: PP_BORDER.thick, borderColor: PP.ink },
});

// ─── Legacy styles ───────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: { maxHeight: 440 },
  sectionLabel: {
    fontSize: FONT_SIZE.caption, fontWeight: FONT_WEIGHT.bold, color: COLORS.disabled,
    marginTop: SPACING.sm, marginBottom: SPACING.xs, letterSpacing: 1,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.sm, marginBottom: SPACING.xs },
  categoryRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.xs,
    gap: SPACING.sm, borderBottomWidth: BORDERS.width, borderBottomColor: COLORS.border,
  },
  colorDot: { width: 14, height: 14, borderRadius: 7, borderWidth: BORDERS.width, borderColor: COLORS.border },
  categoryName: { fontSize: FONT_SIZE.body, color: COLORS.primary },
  flex: { flex: 1 },
  actions: { flexDirection: 'row', gap: SPACING.xs },
  iconBtn: { padding: SPACING.xs, minWidth: TOUCH.minTarget / 2, alignItems: 'center' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.sm, paddingVertical: 4 },
  addBtnText: { fontSize: FONT_SIZE.caption, fontWeight: FONT_WEIGHT.bold, color: COLORS.white },
  premiumBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingVertical: SPACING.sm },
  premiumText: { fontSize: FONT_SIZE.caption, color: COLORS.disabled },
  emptyText: { fontSize: FONT_SIZE.caption, color: COLORS.disabled, paddingVertical: SPACING.sm },
  editor: { marginTop: SPACING.md, borderTopWidth: BORDERS.width, borderTopColor: COLORS.border, paddingTop: SPACING.sm, gap: SPACING.sm },
  editorTitle: { fontSize: FONT_SIZE.body, fontWeight: FONT_WEIGHT.bold, color: COLORS.primary },
  input: {
    borderWidth: BORDERS.width, borderColor: COLORS.border, paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs, fontSize: FONT_SIZE.body, color: COLORS.primary, backgroundColor: COLORS.white,
  },
  colorLabel: { fontSize: FONT_SIZE.caption, color: COLORS.disabled },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  colorSwatch: { width: 30, height: 30, borderWidth: BORDERS.width, borderColor: COLORS.border },
  colorSwatchSelected: { borderWidth: 3, borderColor: COLORS.primary },
  editorButtons: { flexDirection: 'row', gap: SPACING.sm },
  editorBtn: { flex: 1 },
  closeBtn: { marginTop: SPACING.sm },
});
