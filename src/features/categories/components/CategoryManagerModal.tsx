import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PixelModal, PixelButton } from '../../../components/ui';
import { CATEGORIES, COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE, FONT_WEIGHT } from '../../../constants';
import { getCategoryColor } from '../../../constants';
import { useCategories } from '../hooks/useCategories';

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
  const { customCategories, isPremium, addCategory, updateCategory, deleteCategory } = useCategories();
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
      Alert.alert('Błąd', 'Nazwa kategorii nie może być pusta.');
      return;
    }
    if (trimmed.length > 30) {
      Alert.alert('Błąd', 'Nazwa może mieć max. 30 znaków.');
      return;
    }
    const allNames = [...CATEGORIES as readonly string[], ...customCategories.map((c) => c.name)];
    const isDuplicate = allNames.some(
      (n) => n.toLowerCase() === trimmed.toLowerCase() && n !== editor.originalName,
    );
    if (isDuplicate) {
      Alert.alert('Błąd', 'Kategoria o tej nazwie już istnieje.');
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
      'Usuń kategorię',
      `Usunąć "${name}"? Produkty już przypisane do tej kategorii nie zostaną zmienione.`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try { await deleteCategory(name); } finally { setSaving(false); }
          },
        },
      ],
    );
  };

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

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 440,
  },
  sectionLabel: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.disabled,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    letterSpacing: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
    borderBottomWidth: BORDERS.width,
    borderBottomColor: COLORS.border,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
  },
  categoryName: {
    fontSize: FONT_SIZE.body,
    color: COLORS.primary,
  },
  flex: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  iconBtn: {
    padding: SPACING.xs,
    minWidth: TOUCH.minTarget / 2,
    alignItems: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  addBtnText: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
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
  emptyText: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.disabled,
    paddingVertical: SPACING.sm,
  },
  editor: {
    marginTop: SPACING.md,
    borderTopWidth: BORDERS.width,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    gap: SPACING.sm,
  },
  editorTitle: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  input: {
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    fontSize: FONT_SIZE.body,
    color: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  colorLabel: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.disabled,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  editorButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  editorBtn: {
    flex: 1,
  },
  closeBtn: {
    marginTop: SPACING.sm,
  },
});
