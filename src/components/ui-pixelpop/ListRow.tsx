import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const swipeRef = useRef<Swipeable>(null);

  const swipeAction = onDelete ?? onLeave;
  const isLeave = !onDelete && !!onLeave;

  const renderRightActions = (_: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({ inputRange: [-90, 0], outputRange: [1, 0], extrapolate: 'clamp' });
    return (
      <Pressable
        onPress={() => { swipeRef.current?.close(); swipeAction?.(); }}
        style={[styles.swipeAction, { backgroundColor: isLeave ? '#E67E00' : '#FF3B30' }]}
        accessibilityLabel={isLeave ? t('dashboard.listRowUnpinA11y', { title }) : t('dashboard.deleteListA11y', { title })}
      >
        <Animated.View style={{ transform: [{ scale }], alignItems: 'center', gap: 4 }}>
          <PixelIcon name={isLeave ? 'share' : 'trash'} size={18} color={PP.panel} />
          <Text style={styles.swipeLabel}>{isLeave ? t('dashboard.listRowUnpinUpper') : t('common.deleteUpper')}</Text>
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
      activeOffsetX={[-10, 10]}
      failOffsetY={[-5, 5]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={completed ? t('dashboard.listRowCompletedA11y', { title }) : t('dashboard.listRowProgressA11y', { title, done, total })}
        style={[styles.row, !isLast && styles.rowDivider]}
      >
        <View style={[styles.rowContent, completed && { opacity: 0.6 }]}>
          <View style={[styles.tile, { backgroundColor: completed ? '#7EE29A' : tint }]}>
            <PixelIcon name={completed ? 'check' : icon} size={22} color={PP.ink} />
          </View>
          <View style={styles.info}>
            <View style={styles.titleRow}>
              <Text style={ppText.rowTitle} numberOfLines={1}>{title}</Text>
              {code ? <Text style={styles.code}>{code}</Text> : null}
            </View>
            {completed ? (
              <Text style={[ppText.meta, { color: PP.ink }]}>{t('dashboard.listRowComplete')}</Text>
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
        </View>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 12, paddingVertical: 12, backgroundColor: PP.panel },
  rowContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
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
