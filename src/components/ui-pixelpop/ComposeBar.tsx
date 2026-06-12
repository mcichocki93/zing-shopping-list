// ComposeBar.tsx — pływający pasek dodawania (AI / Ręcznie) na ekranie Szczegóły.
// Skopiuj do: src/components/ui-pixelpop/ComposeBar.tsx
//
// To jest WARSTWA PREZENTACJI. Podłącz do istniejącej logiki:
//   - tryb AI:     onSend(text) -> useAIParser().parse(text)
//   - tryb Ręcznie: przełącz na istniejący formularz ręczny (pickery ilości/jednostki/kategorii)
//   - mic:         onMicPressIn / onMicPressOut -> useSpeechInput()
// Dla zwięzłości pole tekstowe jest tu kontrolowane przez propsy.

import React from 'react';
import { View, TextInput, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { PP, PP_BORDER, PP_FONT } from '../../constants/pixelPopTheme';
import { GlassBar } from './GlassBar';
import { SegmentedControl } from './SegmentedControl';
import { PixelIcon } from './PixelIcon';

interface ComposeBarProps {
  mode: number;                 // 0 = AI, 1 = Ręcznie
  onModeChange: (i: number) => void;
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  onMicPressIn?: () => void;
  onMicPressOut?: () => void;
  accent?: string;
  placeholder?: string;
  style?: ViewStyle;
}

export function ComposeBar({
  mode, onModeChange, value, onChangeText, onSend,
  onMicPressIn, onMicPressOut, accent = PP.pink,
  placeholder = '2x mleko, chleb, jabłka…', style,
}: ComposeBarProps) {
  return (
    <GlassBar floating contentStyle={styles.content} style={style}>
      <SegmentedControl options={['✦ AI', '+ RĘCZNIE']} value={mode} onChange={onModeChange} accent={accent} />
      <View style={styles.row}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={PP.muted}
          style={styles.input}
          accessibilityLabel="Dodaj produkt"
        />
        {onMicPressIn && (
          <Pressable onPressIn={onMicPressIn} onPressOut={onMicPressOut} accessibilityLabel="Dyktuj" style={[styles.btn, { backgroundColor: PP.yellow }]}>
            <PixelIcon name="mic" size={16} color={PP.ink} />
          </Pressable>
        )}
        <Pressable onPress={onSend} accessibilityLabel="Dodaj" style={[styles.btn, { backgroundColor: accent }]}>
          <PixelIcon name="chevron" size={16} color={PP.ink} />
        </Pressable>
      </View>
    </GlassBar>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'stretch', gap: 8, marginTop: 10 },
  input: {
    flex: 1, backgroundColor: PP.panel, borderWidth: PP_BORDER.base, borderColor: PP.ink,
    paddingHorizontal: 12, paddingVertical: 10, fontFamily: PP_FONT.ui, fontSize: 13, color: PP.ink,
  },
  btn: { width: 44, alignItems: 'center', justifyContent: 'center', borderWidth: PP_BORDER.base, borderColor: PP.ink },
});

export default ComposeBar;
