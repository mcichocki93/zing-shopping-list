// TemplatesScreen.example.tsx — ekran „Szablony" w stylu Pixel Pop (zakładka bottom tabs).
// Docelowo: src/features/templates/screens/TemplatesScreen.tsx
// Podłącz pod istniejący hook useTemplates() — tu pokazany szkielet z listą + pustym stanem.

import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PP, PP_BORDER, ppText } from '../../../constants/pixelPopTheme';
import { HardShadow, PixelIcon } from '../../../components/ui-pixelpop';

interface TemplateLike { id: string; name: string; items: unknown[]; }

export function TemplatesScreen({
  templates = [],
  accent = PP.pink,
  onUse,
  onCreate,
}: {
  templates?: TemplateLike[];
  accent?: string;
  onUse?: (id: string) => void;
  onCreate?: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: PP.paper }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 110 }}>
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={ppText.brand}>SZABLONY</Text>
          <Text style={[ppText.title, { marginTop: 4 }]}>Twoje szablony</Text>
          <Text style={[ppText.meta, { marginTop: 4 }]}>{templates.length} zapisanych</Text>
        </View>

        {templates.length === 0 ? (
          <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
            <HardShadow offset={4}>
              <View style={styles.empty}>
                <PixelIcon name="template" size={40} color={PP.ink} />
                <Text style={[ppText.rowTitle, { marginTop: 12, textAlign: 'center' }]}>Brak szablonów</Text>
                <Text style={[ppText.meta, { marginTop: 6, textAlign: 'center' }]}>
                  Zapisz dowolną listę jako szablon z menu (⋯) na ekranie szczegółów.
                </Text>
              </View>
            </HardShadow>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 16, marginTop: 16, gap: 12 }}>
            {templates.map((t) => (
              <HardShadow key={t.id} offset={4}>
                <Pressable onPress={() => onUse?.(t.id)} style={styles.card}>
                  <View style={[styles.tile, { backgroundColor: accent }]}>
                    <PixelIcon name="template" size={20} color={PP.ink} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={ppText.rowTitle}>{t.name}</Text>
                    <Text style={[ppText.meta, { marginTop: 2 }]}>{t.items.length} produktów</Text>
                  </View>
                  <PixelIcon name="chevron" size={12} color={PP.muted} />
                </Pressable>
              </HardShadow>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { backgroundColor: PP.panel, borderWidth: PP_BORDER.thick, borderColor: PP.ink, padding: 24, alignItems: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: PP.panel, borderWidth: PP_BORDER.thick, borderColor: PP.ink, padding: 12 },
  tile: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: PP_BORDER.base, borderColor: PP.ink },
});

export default TemplatesScreen;
