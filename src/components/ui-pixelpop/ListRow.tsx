import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { PP, PP_BORDER, PP_FONT, ppText } from '../../constants/pixelPopTheme';
import { PixelIcon } from './PixelIcon';
import { SegmentProgress } from './SegmentProgress';

interface ListRowProps {
  title: string;
  done: number;
  total: number;
  completed?: boolean;
  code?: string;
  tint?: string;
  icon?: string;
  isLast?: boolean;
  accent?: string;
  onPress?: () => void;
  onDelete?: () => void;
  onLeave?: () => void;
}

export function ListRow({ title, done, total, completed, code, tint = PP.cyan, icon = 'cart', isLast, accent = PP.pink, onPress, onDelete, onLeave }: ListRowProps) {
  const swipeRef = useRef<Swipeable>(null);

  const swipeAction = onDelete ?? onLeave;
  const isLeave = !onDelete && !!onLeave;

  const renderRightActions = (_: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({ inputRange: [-90, 0], outputRange: [1, 0], extrapolate: 'clamp' });
    return (
      <Pressable
        onPress={() => { swipeRef.current?.close(); swipeAction?.(); }}
        style={[styles.swipeAction, { backgroundColor: isLeave ? '#E67E00' : '#FF3B30' }]}
        accessibilityLabel={isLeave ? `Odepnij się od ${title}` : `Usuń ${title}`}
      >
        <Animated.View style={{ transform: [{ scale }], alignItems: 'center', gap: 4 }}>
          <PixelIcon name={isLeave ? 'share' : 'trash'} size={18} color={PP.panel} />
          <Text style={styles.swipeLabel}>{isLeave ? 'ODEPNIJ' : 'USUŃ'}</Text>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={swipeAction ? renderRightActions : undefined}
      friction={2}
      rightThreshold={60}
      overshootRight={false}
    >
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
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: PP.panel },
  rowDivider: { borderBottomWidth: 2, borderBottomColor: PP.paper, borderStyle: 'dashed' },
  tile: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: PP_BORDER.base, borderColor: PP.ink },
  info: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  code: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: PP.paper, backgroundColor: PP.ink, paddingHorizontal: 5, paddingVertical: 1, marginLeft: 'auto' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swipeAction: { width: 84, alignItems: 'center', justifyContent: 'center' },
  swipeLabel: { fontFamily: PP_FONT.display, fontSize: 8, color: PP.panel, letterSpacing: 0.5 },
});

export default ListRow;
