// ListRow.tsx — wiersz listy w zgrupowanym bloku (Dashboard).
// Skopiuj do: src/components/ui-pixelpop/ListRow.tsx

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { PP, PP_BORDER, ppText } from '../../constants/pixelPopTheme';
import { PixelIcon } from './PixelIcon';
import { SegmentProgress } from './SegmentProgress';

interface ListRowProps {
  title: string;
  done: number;
  total: number;
  completed?: boolean;
  code?: string;        // inviteCode
  tint?: string;        // kolor kafelka ikony
  icon?: string;        // pixel icon name (kategoria/cart)
  isLast?: boolean;
  accent?: string;
  onPress?: () => void;
}

export function ListRow({ title, done, total, completed, code, tint = PP.cyan, icon = 'cart', isLast, accent = PP.pink, onPress }: ListRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${completed ? 'zrealizowana' : `${done} z ${total} kupionych`}`}
      style={[styles.row, !isLast && styles.rowDivider, completed && { opacity: 0.6 }]}
    >
      <View style={[styles.tile, { backgroundColor: completed ? '#7EE29A' : tint }]}>
        <PixelIcon name={completed ? 'check' : icon} size={22} color={PP.ink} />
      </View>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={ppText.rowTitle} numberOfLines={1}>{title}</Text>
          {code ? <Text style={styles.code}>{code}</Text> : null}
        </View>
        {completed ? (
          <Text style={[ppText.meta, { color: PP.ink }]}>✓ KOMPLET</Text>
        ) : (
          <View style={styles.progressRow}>
            <View style={{ width: 54 }}>
              <SegmentProgress total={12} done={done} height={6} fill={accent} empty="#EFE7DA" />
            </View>
            <Text style={ppText.meta}>{done}/{total}</Text>
          </View>
        )}
      </View>
      <PixelIcon name="chevron" size={12} color={PP.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 12 },
  rowDivider: { borderBottomWidth: 2, borderBottomColor: PP.paper, borderStyle: 'dashed' },
  tile: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: PP_BORDER.base, borderColor: PP.ink },
  info: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  code: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: PP.paper, backgroundColor: PP.ink, paddingHorizontal: 5, paddingVertical: 1, marginLeft: 'auto' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});

export default ListRow;
