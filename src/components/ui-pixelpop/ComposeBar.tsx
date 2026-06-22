// ComposeBar.tsx — pływający pasek dodawania (AI / Ręcznie) na ekranie Szczegóły.
// Skopiuj do: src/components/ui-pixelpop/ComposeBar.tsx
//
// To jest WARSTWA PREZENTACJI. Podłącz do istniejącej logiki:
//   - tryb AI:     onSend(text) -> useAIParser().parse(text)
//   - tryb Ręcznie: przełącz na istniejący formularz ręczny (pickery ilości/jednostki/kategorii)
//   - mic:         onMicPress (toggle) + isListening -> useSpeechInput()
// Dla zwięzłości pole tekstowe jest tu kontrolowane przez propsy.

import React from 'react';
import { View, TextInput, Pressable, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
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
  onMicPress?: () => void;
  isListening?: boolean;
  micDisabled?: boolean;
  isParsing?: boolean;
  accent?: string;
  placeholder?: string;
  style?: ViewStyle;
  floating?: boolean;
}

export function ComposeBar({
  mode, onModeChange, value, onChangeText, onSend,
  onMicPress, isListening = false, micDisabled = false, isParsing = false, accent = PP.pink,
  placeholder = '2x mleko, chleb, jabłka…', style, floating = true,
}: ComposeBarProps) {
  return (
    <GlassBar floating={floating} contentStyle={styles.content} style={style}>
      <SegmentedControl options={['✦ AI', '+ RĘCZNIE']} value={mode} onChange={onModeChange} accent={accent} />
      <View style={styles.row}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={PP.muted}
          style={styles.input}
          editable={!isParsing}
          accessibilityLabel="Dodaj produkt"
        />
        {onMicPress && mode === 0 && (
          <Pressable
            onPress={micDisabled || isParsing ? undefined : onMicPress}
            accessibilityLabel={isListening ? 'Zatrzymaj dyktowanie' : 'Dyktuj'}
            style={[styles.btn, { backgroundColor: isListening ? '#FF3B30' : PP.yellow, opacity: micDisabled || isParsing ? 0.35 : 1 }]}
          >
            <PixelIcon name="mic" size={16} color={PP.ink} />
          </Pressable>
        )}
        <Pressable
          onPress={isParsing ? undefined : onSend}
          disabled={isParsing}
          accessibilityLabel={isParsing ? 'Przetwarzanie' : 'Dodaj'}
          style={[styles.btn, { backgroundColor: accent, opacity: isParsing ? 0.6 : 1 }]}
        >
          {isParsing ? <ActivityIndicator size="small" color={PP.ink} /> : <PixelIcon name="chevron" size={16} color={PP.ink} />}
        </Pressable>
      </View>
      {isParsing && mode === 0 ? (
        <Text style={styles.hint}>✦ AI rozpoznaje produkty...</Text>
      ) : onMicPress && !micDisabled && mode === 0 ? (
        <Text style={[styles.hint, isListening && styles.hintActive]}>
          {isListening ? '🎙 Mów... naciśnij ponownie by zatrzymać' : '🎙 Naciśnij żółty przycisk by dyktować'}
        </Text>
      ) : null}
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
  hint: { marginTop: 6, fontFamily: PP_FONT.ui, fontSize: 10, color: PP.muted, textAlign: 'center' },
  hintActive: { color: '#FF3B30' },
});

export default ComposeBar;
