// CategoryCard.tsx — sekcja kategorii z wierszami pozycji (ekran Szczegóły).
// Skopiuj do: src/components/ui-pixelpop/CategoryCard.tsx

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { PP, PP_BORDER, PP_FONT, ppText, ppCategoryColor } from '../../constants/pixelPopTheme';
import { HardShadow } from './HardShadow';
import { PixelCheckbox2 } from './PixelCheckbox2';
import { PixelIcon } from './PixelIcon';

export interface CategoryItem {
  id: string;
  name: string;
  quantity: number | string;
  unit?: string;
  isCompleted?: boolean;
}

interface CategoryCardProps {
  category: string;
  icon?: string;            // pixel icon name
  items: CategoryItem[];
  onToggle: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function CategoryCard({ category, icon = 'apple', items, onToggle, onEdit }: CategoryCardProps) {
  const remaining = items.filter((i) => !i.isCompleted).length;
  return (
    <HardShadow offset={3}>
      <View style={styles.card}>
        {/* nagłówek */}
        <View style={[styles.header, { backgroundColor: ppCategoryColor(category) }]}>
          <View style={styles.headerTile}>
            <PixelIcon name={icon} size={12} color={PP.ink} />
          </View>
          <Text style={[ppText.catLabel, styles.headerLabel]} numberOfLines={1}>{category.toUpperCase()}</Text>
          <Text style={[ppText.meta, { color: PP.ink }]}>{remaining}/{items.length}</Text>
        </View>
        {/* wiersze */}
        {items.map((it, i) => (
          <View
            key={it.id}
            style={[
              styles.itemRow,
              i < items.length - 1 && styles.itemDivider,
              it.isCompleted && { backgroundColor: PP.paper },
            ]}
          >
            <PixelCheckbox2
              checked={!!it.isCompleted}
              onToggle={() => onToggle(it.id)}
              accessibilityLabel={`${it.name}, ${it.isCompleted ? 'kupione' : 'do kupienia'}`}
            />
            <View style={{ flex: 1 }}>
              <Text style={[ppText.rowBody, it.isCompleted && styles.done]}>{it.name}</Text>
              <Text style={styles.qty}>{it.quantity} {it.unit ?? 'szt'}</Text>
            </View>
            {onEdit && (
              <Pressable onPress={() => onEdit(it.id)} hitSlop={8} accessibilityLabel={`Edytuj ${it.name}`} style={styles.editBtn}>
                <PixelIcon name="edit" size={12} color={PP.muted} />
              </Pressable>
            )}
          </View>
        ))}
      </View>
    </HardShadow>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: PP.panel, borderWidth: PP_BORDER.thick, borderColor: PP.ink },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: PP_BORDER.thick, borderBottomColor: PP.ink },
  headerTile: { width: 22, height: 22, backgroundColor: PP.paper, alignItems: 'center', justifyContent: 'center', borderWidth: PP_BORDER.thin, borderColor: PP.ink },
  headerLabel: { flex: 1 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 12, paddingVertical: 12, minHeight: 44 },
  itemDivider: { borderBottomWidth: 2, borderBottomColor: PP.paper, borderStyle: 'dashed' },
  done: { textDecorationLine: 'line-through', color: PP.muted },
  qty: { fontFamily: PP_FONT.uiSemi, fontSize: 10, color: PP.muted, marginTop: 1 },
  editBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
});

export default CategoryCard;
