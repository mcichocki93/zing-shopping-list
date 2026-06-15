import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
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
  icon?: string;
  items: CategoryItem[];
  onToggle: (id: string) => void;
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
  drag?: () => void;
}

function SwipeableRow({
  it,
  index,
  total,
  onToggle,
  onEdit,
  onRemove,
}: {
  it: CategoryItem;
  index: number;
  total: number;
  onToggle: (id: string) => void;
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
}) {
  const swipeRef = useRef<Swipeable>(null);

  const renderRightActions = (_: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({ inputRange: [-80, 0], outputRange: [1, 0], extrapolate: 'clamp' });
    return (
      <Pressable
        onPress={() => { swipeRef.current?.close(); onRemove?.(it.id); }}
        style={styles.deleteAction}
        accessibilityLabel={`Usuń ${it.name}`}
      >
        <Animated.View style={{ transform: [{ scale }], alignItems: 'center', gap: 3 }}>
          <PixelIcon name="trash" size={16} color={PP.panel} />
          <Text style={styles.deleteLabel}>USUŃ</Text>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={onRemove ? renderRightActions : undefined}
      friction={2}
      rightThreshold={50}
      overshootRight={false}
    >
      <View
        style={[
          styles.itemRow,
          index < total - 1 && styles.itemDivider,
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
            <PixelIcon name="edit" size={13} color={PP.ink} />
          </Pressable>
        )}
      </View>
    </Swipeable>
  );
}

export function CategoryCard({ category, icon = 'apple', items, onToggle, onEdit, onRemove, drag }: CategoryCardProps) {
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
          {drag && (
            <Pressable onLongPress={drag} hitSlop={6} accessibilityLabel="Przeciągnij kategorię" style={styles.dragBtn}>
              <PixelIcon name="drag" size={12} color={PP.ink} />
            </Pressable>
          )}
        </View>
        {/* wiersze */}
        {items.map((it, i) => (
          <SwipeableRow
            key={it.id}
            it={it}
            index={i}
            total={items.length}
            onToggle={onToggle}
            onEdit={onEdit}
            onRemove={onRemove}
          />
        ))}
      </View>
    </HardShadow>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: PP.panel, borderWidth: PP_BORDER.thick, borderColor: PP.ink, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: PP_BORDER.thick, borderBottomColor: PP.ink },
  headerTile: { width: 22, height: 22, backgroundColor: PP.paper, alignItems: 'center', justifyContent: 'center', borderWidth: PP_BORDER.thin, borderColor: PP.ink },
  headerLabel: { flex: 1 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 12, paddingVertical: 12, minHeight: 44, backgroundColor: PP.panel },
  itemDivider: { borderBottomWidth: 2, borderBottomColor: PP.paper, borderStyle: 'dashed' },
  done: { textDecorationLine: 'line-through', color: PP.muted },
  qty: { fontFamily: PP_FONT.uiSemi, fontSize: 10, color: PP.muted, marginTop: 1 },
  editBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  dragBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
  deleteAction: { backgroundColor: '#FF3B30', width: 72, alignItems: 'center', justifyContent: 'center' },
  deleteLabel: { fontFamily: PP_FONT.display, fontSize: 8, color: PP.panel, letterSpacing: 0.5 },
});

export default CategoryCard;
