import React from 'react';
import { KeyboardAvoidingView, Platform, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDERS, FONT_SIZE, FONT_WEIGHT } from '../../constants';

interface PixelModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function PixelModal({ visible, onClose, title, children }: PixelModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.title}>{title}</Text>
            {children}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  content: {
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.width + 1,
    borderColor: COLORS.border,
    borderRadius: BORDERS.radius,
    padding: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.h3,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
});
