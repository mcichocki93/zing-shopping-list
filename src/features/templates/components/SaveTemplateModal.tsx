import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PP, PP_BORDER, PP_FONT } from '../../../constants/pixelPopTheme';
import { PPModal } from '../../../components/ui-pixelpop';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTemplates } from '../hooks/useTemplates';
import type { TemplateItem } from '../../../types/template';

interface Props {
  visible: boolean;
  /** Domyślna nazwa szablonu — zwykle tytuł listy. */
  defaultName: string;
  items: TemplateItem[];
  onClose: () => void;
  onSaved?: () => void;
}

export function SaveTemplateModal({ visible, defaultName, items, onClose, onSaved }: Props) {
  const { t } = useTranslation();
  const { pixelPopAccent } = useTheme();
  const { handleSave, error } = useTemplates({ load: false });
  const [name, setName] = useState(defaultName);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) setName(defaultName);
  }, [visible, defaultName]);

  const onSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed || items.length === 0 || saving) return;
    setSaving(true);
    const id = await handleSave(trimmed, items);
    setSaving(false);
    if (id) {
      onSaved?.();
      onClose();
    }
  };

  return (
    <PPModal visible={visible} onClose={onClose} title={t('templates.saveTitle')}>
      {items.length === 0 ? (
        <Text style={pp.emptyText}>{t('templates.emptyList')}</Text>
      ) : (
        <>
          <TextInput
            style={pp.input}
            value={name}
            onChangeText={setName}
            placeholder={t('templates.namePlaceholder')}
            placeholderTextColor={PP.muted}
            maxLength={60}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
            accessibilityLabel={t('templates.namePlaceholder')}
          />
          <Text style={pp.meta}>{t('templates.items', { count: items.length })}</Text>
          {error ? <Text style={pp.errorText}>{error}</Text> : null}
        </>
      )}

      <View style={pp.buttons}>
        {items.length > 0 && (
          <Pressable
            onPress={onSubmit}
            disabled={saving || !name.trim()}
            style={[pp.btn, { backgroundColor: pixelPopAccent, opacity: saving || !name.trim() ? 0.6 : 1 }]}
            accessibilityLabel={t('common.save')}
          >
            <Text style={pp.btnText}>{t('common.save')}</Text>
          </Pressable>
        )}
        <Pressable onPress={onClose} style={[pp.btn, { backgroundColor: PP.paper }]} accessibilityLabel={t('common.cancel')}>
          <Text style={pp.btnText}>{t('common.cancel')}</Text>
        </Pressable>
      </View>
    </PPModal>
  );
}

const pp = StyleSheet.create({
  input: {
    borderWidth: PP_BORDER.base, borderColor: PP.ink, backgroundColor: PP.paper,
    paddingHorizontal: 10, paddingVertical: 10, marginTop: 12,
    fontFamily: PP_FONT.uiSemi, fontSize: 13, color: PP.ink,
  },
  meta: { fontFamily: PP_FONT.uiSemi, fontSize: 11, color: PP.muted, marginTop: 8 },
  emptyText: { fontFamily: PP_FONT.uiSemi, fontSize: 12, color: PP.muted, paddingVertical: 12, lineHeight: 20 },
  errorText: { fontFamily: PP_FONT.uiSemi, fontSize: 11, color: '#FF3B30', marginTop: 8 },
  buttons: { flexDirection: 'row', gap: 8, marginTop: 14 },
  btn: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderWidth: PP_BORDER.thick, borderColor: PP.ink,
  },
  btnText: { fontFamily: PP_FONT.display, fontSize: 9, color: PP.ink },
});
