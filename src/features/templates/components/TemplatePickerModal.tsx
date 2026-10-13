import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PP, PP_BORDER, PP_FONT, ppText } from '../../../constants/pixelPopTheme';
import { PPModal, PixelIcon } from '../../../components/ui-pixelpop';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTemplates } from '../hooks/useTemplates';
import type { ListTemplate } from '../../../types/template';

interface Props {
  visible: boolean;
  onSelect: (template: ListTemplate) => void;
  onClose: () => void;
}

export function TemplatePickerModal({ visible, onSelect, onClose }: Props) {
  const { t } = useTranslation();
  const { pixelPopAccent } = useTheme();
  const { templates, isLoading, reload } = useTemplates({ load: false });

  useEffect(() => {
    if (visible) reload();
  }, [visible, reload]);

  return (
    <PPModal visible={visible} onClose={onClose} title={t('templates.pickerTitle')}>
      {isLoading ? (
        <ActivityIndicator size="small" color={pixelPopAccent} style={pp.loader} />
      ) : templates.length === 0 ? (
        <Text style={pp.emptyText}>{t('templates.empty')}</Text>
      ) : (
        <ScrollView style={pp.scroll} showsVerticalScrollIndicator={false}>
          {templates.map((tpl) => (
            <Pressable
              key={tpl.id}
              onPress={() => { onSelect(tpl); onClose(); }}
              style={pp.row}
              accessibilityRole="button"
              accessibilityLabel={t('templates.pickA11y', { name: tpl.name })}
            >
              <PixelIcon name="template" size={16} color={PP.ink} />
              <View style={pp.rowInfo}>
                <Text style={ppText.rowBody}>{tpl.name}</Text>
                <Text style={ppText.meta}>{t('templates.items', { count: tpl.items.length })}</Text>
              </View>
              <PixelIcon name="chevron" size={12} color={PP.muted} />
            </Pressable>
          ))}
        </ScrollView>
      )}

      <Pressable onPress={onClose} style={pp.closeBtn} accessibilityLabel={t('common.close')}>
        <Text style={pp.closeBtnText}>{t('templates.close')}</Text>
      </Pressable>
    </PPModal>
  );
}

const pp = StyleSheet.create({
  loader: { marginVertical: 16 },
  scroll: { maxHeight: 360 },
  emptyText: { fontFamily: PP_FONT.uiSemi, fontSize: 12, color: PP.muted, paddingVertical: 12, lineHeight: 20 },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    gap: 10, borderBottomWidth: PP_BORDER.thin, borderBottomColor: PP.ink + '33',
  },
  rowInfo: { flex: 1 },
  closeBtn: {
    marginTop: 14, alignItems: 'center', paddingVertical: 12,
    borderWidth: PP_BORDER.thick, borderColor: PP.ink, backgroundColor: PP.ink,
  },
  closeBtnText: { fontFamily: PP_FONT.display, fontSize: 9, color: PP.paper },
});
