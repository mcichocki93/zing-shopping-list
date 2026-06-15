import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { PP, PP_BORDER, PP_FONT, ppText } from '../../constants/pixelPopTheme';

interface PPModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function PPModal({ visible, onClose, title, children }: PPModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.overlay}>
          {/* Backdrop: absolutnie pod contentem, nie owija ScrollView */}
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          {/* Sheet: zwykły View — nie blokuje gestów przewijania */}
          <View style={s.sheet}>
            <View style={s.header}>
              <Text style={ppText.catLabel}>{title}</Text>
              <Pressable onPress={onClose} style={s.closeBtn} accessibilityLabel="Zamknij">
                <Text style={s.closeMark}>✕</Text>
              </Pressable>
            </View>
            {children}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18,14,34,0.65)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  sheet: {
    backgroundColor: PP.panel,
    borderWidth: PP_BORDER.thick,
    borderColor: PP.ink,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: PP_BORDER.thin,
    borderBottomColor: PP.ink,
  },
  closeBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: PP_BORDER.base,
    borderColor: PP.ink,
    backgroundColor: PP.paper,
  },
  closeMark: { fontFamily: PP_FONT.display, fontSize: 11, color: PP.ink },
});
