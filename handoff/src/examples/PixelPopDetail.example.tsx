// PixelPopDetail.example.tsx — PRZYKŁAD złożenia ekranu Szczegóły listy.
// Wzorzec do przeniesienia do ListDetailScreen.tsx (za flagą usePixelPop).

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PP, PP_BORDER, PP_FONT, ppText } from '../../../constants/pixelPopTheme';
import { HardShadow, SegmentProgress, CategoryCard, ComposeBar, PixelIcon, type CategoryItem } from '../../../components/ui-pixelpop';

interface CategoryGroupLike { category: string; icon?: string; items: CategoryItem[]; }

export function PixelPopDetail({
  title,
  inviteCode,
  memberCount = 1,
  groups,
  accent = PP.pink,
  onBack,
  onShare,
  onMenu,
  onToggle,
  onEdit,
  // compose
  composeValue,
  onComposeChange,
  onSend,
  onMicPressIn,
  onMicPressOut,
}: {
  title: string;
  inviteCode?: string;
  memberCount?: number;
  groups: CategoryGroupLike[];
  accent?: string;
  onBack: () => void;
  onShare: () => void;
  onMenu: () => void;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  composeValue: string;
  onComposeChange: (t: string) => void;
  onSend: () => void;
  onMicPressIn?: () => void;
  onMicPressOut?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState(0);

  const allItems = groups.flatMap((g) => g.items);
  const done = allItems.filter((i) => i.isCompleted).length;
  const total = allItems.length;

  return (
    <View style={{ flex: 1, backgroundColor: PP.paper }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 170 }}>
        {/* Nav */}
        <View style={styles.nav}>
          <Pressable onPress={onBack} style={styles.iconBtn}><PixelIcon name="chevronL" size={16} color={PP.ink} /></Pressable>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable onPress={onShare} style={styles.iconBtn}><PixelIcon name="share" size={14} color={PP.ink} /></Pressable>
            <Pressable onPress={onMenu} style={styles.iconBtn}><PixelIcon name="menu" size={14} color={PP.ink} /></Pressable>
          </View>
        </View>

        {/* Tytuł + meta */}
        <View style={{ paddingHorizontal: 18, paddingTop: 8 }}>
          <Text style={ppText.title}>{title}</Text>
          <View style={styles.metaRow}>
            {inviteCode ? <Text style={styles.code}>KOD · {inviteCode}</Text> : null}
            <Text style={ppText.meta}>{memberCount} {memberCount === 1 ? 'osoba' : 'osoby'}</Text>
          </View>
        </View>

        {/* Karta postępu */}
        <View style={{ paddingHorizontal: 16, marginTop: 14, marginBottom: 16 }}>
          <HardShadow offset={4}>
            <View style={styles.progressCard}>
              <View style={styles.progressHead}>
                <Text style={ppText.catLabel}>POSTĘP</Text>
                <Text style={{ fontFamily: PP_FONT.display, fontSize: 16, color: PP.ink }}>
                  {done}<Text style={{ fontSize: 10, color: PP.muted }}>/{total}</Text>
                </Text>
              </View>
              <SegmentProgress total={Math.max(total, 1)} done={done} height={10} fill={accent} empty="#EFE7DA" gap={3} />
            </View>
          </HardShadow>
        </View>

        {/* Sekcje kategorii */}
        <View style={{ paddingHorizontal: 16, gap: 14 }}>
          {groups.map((g) => (
            <CategoryCard
              key={g.category}
              category={g.category}
              icon={g.icon}
              items={g.items}
              onToggle={onToggle}
              onEdit={onEdit}
            />
          ))}
        </View>
      </ScrollView>

      {/* Compose bar — podłącz do useAIParser / useSpeechInput / formularza ręcznego */}
      <ComposeBar
        mode={mode}
        onModeChange={setMode}
        value={composeValue}
        onChangeText={onComposeChange}
        onSend={onSend}
        onMicPressIn={onMicPressIn}
        onMicPressOut={onMicPressOut}
        accent={accent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 4 },
  iconBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: PP.panel, borderWidth: PP_BORDER.thick, borderColor: PP.ink },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  code: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: PP.paper, backgroundColor: PP.ink, paddingHorizontal: 6, paddingVertical: 3 },
  progressCard: { backgroundColor: PP.panel, borderWidth: PP_BORDER.thick, borderColor: PP.ink, padding: 12 },
  progressHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 },
});

export default PixelPopDetail;
