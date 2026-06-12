// SegmentedControl.tsx — przełącznik AI / Ręcznie (ostra ramka, akcent na aktywnym).
// Skopiuj do: src/components/ui-pixelpop/SegmentedControl.tsx

import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { PP, PP_BORDER, ppText } from '../../constants/pixelPopTheme';

interface SegmentedControlProps {
  options: string[];           // np. ['✦ AI', '+ RĘCZNIE']
  value: number;               // aktywny index
  onChange: (index: number) => void;
  accent?: string;
}

export function SegmentedControl({ options, value, onChange, accent = PP.pink }: SegmentedControlProps) {
  return (
    <View style={styles.row}>
      {options.map((opt, i) => {
        const active = i === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(i)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[
              styles.seg,
              i > 0 && styles.segDivider,
              { backgroundColor: active ? accent : 'transparent' },
            ]}
          >
            <Text style={[ppText.segment, { color: active ? PP.ink : PP.muted }]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', borderWidth: PP_BORDER.base, borderColor: PP.ink },
  seg: { flex: 1, paddingVertical: 6, alignItems: 'center', justifyContent: 'center', minHeight: 32 },
  segDivider: { borderLeftWidth: PP_BORDER.base, borderLeftColor: PP.ink },
});

export default SegmentedControl;
