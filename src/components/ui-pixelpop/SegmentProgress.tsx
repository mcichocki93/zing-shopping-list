// SegmentProgress.tsx — pasek postępu zbudowany z pixelowych segmentów.
// Skopiuj do: src/components/ui-pixelpop/SegmentProgress.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PP } from '../../constants/pixelPopTheme';

interface SegmentProgressProps {
  total: number;
  done: number;
  height?: number;
  fill?: string;     // kolor wypełnionych
  empty?: string;    // kolor pustych
  gap?: number;
}

export function SegmentProgress({
  total,
  done,
  height = 6,
  fill = PP.ink,
  empty = '#EFE7DA',
  gap = 2,
}: SegmentProgressProps) {
  return (
    <View style={[styles.row, { height, gap }]}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            backgroundColor: i < done ? fill : empty,
            borderWidth: 1,
            borderColor: PP.ink,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'stretch' },
});

export default SegmentProgress;
