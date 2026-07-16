// HeroStat.tsx — karta „TEN TYDZIEŃ" z dużą liczbą i segmentowym progresem.
// Skopiuj do: src/components/ui-pixelpop/HeroStat.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PP, PP_BORDER, PP_FONT } from '../../constants/pixelPopTheme';
import { HardShadow } from './HardShadow';
import { SegmentProgress } from './SegmentProgress';
import { PixelIcon } from './PixelIcon';

interface HeroStatProps {
  label?: string;
  done: number;
  total: number;
  caption?: string;
  accent?: string;
}

export function HeroStat({ label, done, total, caption, accent = PP.pink }: HeroStatProps) {
  const { t } = useTranslation();
  return (
    <HardShadow offset={5} style={styles.wrap}>
      <View style={[styles.card, { backgroundColor: accent }]}>
        <Text style={styles.label}>{label ?? t('dashboard.heroThisWeek')}</Text>
        <Text style={styles.num}>
          {done}
          <Text style={styles.numSmall}>/{total}</Text>
        </Text>
        <Text style={styles.caption}>{caption ?? t('dashboard.heroCaption')}</Text>
        <View style={{ marginTop: 12 }}>
          <SegmentProgress total={16} done={Math.round((done / Math.max(total, 1)) * 16)} height={8} fill={PP.ink} empty="rgba(18,14,34,0.18)" gap={3} />
        </View>
        <View style={styles.decor} pointerEvents="none">
          <PixelIcon name="cart" size={76} color={PP.ink} />
        </View>
      </View>
    </HardShadow>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  card: { borderWidth: PP_BORDER.thick, borderColor: PP.ink, paddingHorizontal: 16, paddingVertical: 14, overflow: 'hidden' },
  label: { fontFamily: PP_FONT.display, fontSize: 10, color: PP.ink, opacity: 0.8, letterSpacing: 0.6 },
  num: { fontFamily: PP_FONT.display, fontSize: 42, color: PP.ink, marginTop: 6 },
  numSmall: { fontSize: 18, opacity: 0.55 },
  caption: { fontFamily: PP_FONT.uiSemi, fontSize: 12, color: PP.ink, opacity: 0.85, marginTop: 4 },
  decor: { position: 'absolute', right: -10, bottom: -8, opacity: 0.28, transform: [{ rotate: '12deg' }] },
});

export default HeroStat;
