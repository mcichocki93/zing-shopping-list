// PixelPopDashboard.example.tsx — PRZYKŁAD złożenia ekranu Dashboard z komponentów.
// To jest wzorzec do przeniesienia do ListsDashboardScreen.tsx (za flagą usePixelPop).
// Nazwy hooków/propsów dopasuj do istniejącego ekranu.

import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PP, PP_BORDER, ppText, ppCategoryColor } from '../../../constants/pixelPopTheme';
import { HardShadow, HeroStat, SearchField, ListRow, Fab, PixelIcon } from '../../../components/ui-pixelpop';

// Załóżmy dane z istniejącego hooka useShoppingLists()
interface ShoppingListLike {
  id: string;
  title: string;
  items: { isCompleted?: boolean; category?: string }[];
  inviteCode?: string;
}

export function PixelPopDashboard({
  lists,
  displayName = 'Marcin',
  accent = PP.pink,
  onOpenList,
  onCreate,
  onOpenSettings,
  onShare,
}: {
  lists: ShoppingListLike[];
  displayName?: string;
  accent?: string;
  onOpenList: (id: string) => void;
  onCreate: () => void;
  onOpenSettings: () => void;
  onShare: () => void;
}) {
  const insets = useSafeAreaInsets();
  const totalItems = lists.reduce((s, l) => s + l.items.length, 0);
  const doneItems = lists.reduce((s, l) => s + l.items.filter((i) => i.isCompleted).length, 0);

  return (
    <View style={{ flex: 1, backgroundColor: PP.paper }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 110 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <HardShadow offset={3}>
              <View style={[styles.logo, { backgroundColor: accent }]}>
                <PixelIcon name="logo" size={18} color={PP.ink} />
              </View>
            </HardShadow>
            <View style={{ marginLeft: 10 }}>
              <Text style={ppText.brand}>ZING</Text>
              <Text style={[ppText.meta, { marginTop: 2 }]}>cześć, {displayName} ✦</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable onPress={onShare} style={styles.iconBtn}><PixelIcon name="share" size={14} color={PP.ink} /></Pressable>
            <Pressable onPress={onOpenSettings} style={styles.iconBtn}><PixelIcon name="gear" size={14} color={PP.ink} /></Pressable>
          </View>
        </View>

        {/* Tytuł + search */}
        <View style={{ paddingHorizontal: 16, paddingTop: 6 }}>
          <Text style={ppText.title}>Twoje listy</Text>
          <View style={{ marginTop: 12 }}><SearchField /></View>
        </View>

        {/* Hero stat */}
        <View style={{ paddingHorizontal: 16, marginTop: 14, marginBottom: 16 }}>
          <HeroStat done={doneItems} total={totalItems} accent={accent} />
        </View>

        {/* Sekcja */}
        <View style={styles.sectionHead}>
          <Text style={ppText.catLabel}>PRZYPIĘTE</Text>
          <Text style={ppText.meta}>WSZYSTKIE · {lists.length}</Text>
        </View>

        {/* Zgrupowany blok list */}
        <View style={{ paddingHorizontal: 16 }}>
          <HardShadow offset={4}>
            <View style={styles.listBlock}>
              {lists.map((l, i) => {
                const done = l.items.filter((it) => it.isCompleted).length;
                const completed = l.items.length > 0 && done === l.items.length;
                const cat = l.items[0]?.category ?? 'Inne';
                return (
                  <ListRow
                    key={l.id}
                    title={l.title}
                    done={done}
                    total={l.items.length}
                    completed={completed}
                    code={l.inviteCode}
                    tint={ppCategoryColor(cat)}
                    icon="apple"
                    isLast={i === lists.length - 1}
                    accent={accent}
                    onPress={() => onOpenList(l.id)}
                  />
                );
              })}
            </View>
          </HardShadow>
        </View>
      </ScrollView>

      <Fab onPress={onCreate} accent={accent} bottomOffset={insets.bottom + 86} accessibilityLabel="Nowa lista" />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 14 },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: PP_BORDER.thick, borderColor: PP.ink, transform: [{ rotate: '-4deg' }] },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: PP.panel, borderWidth: PP_BORDER.thick, borderColor: PP.ink },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 },
  listBlock: { backgroundColor: PP.panel, borderWidth: PP_BORDER.thick, borderColor: PP.ink },
});

export default PixelPopDashboard;
