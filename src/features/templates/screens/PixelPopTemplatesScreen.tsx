import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PP, PP_BORDER, ppText } from '../../../constants/pixelPopTheme';
import { HardShadow, PixelIcon } from '../../../components/ui-pixelpop';
import { TemplateManagerModal } from '../components/TemplateManagerModal';

export function PixelPopTemplatesScreen() {
  const insets = useSafeAreaInsets();
  const [showManager, setShowManager] = React.useState(false);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
        <Text style={ppText.title}>Szablony</Text>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <HardShadow offset={4}>
          <Pressable
            onPress={() => setShowManager(true)}
            style={styles.card}
            accessibilityLabel="Zarządzaj szablonami"
          >
            <PixelIcon name="template" size={20} color={PP.ink} />
            <View style={{ flex: 1 }}>
              <Text style={ppText.rowTitle}>Zarządzaj szablonami</Text>
              <Text style={ppText.meta}>Edytuj i usuń swoje szablony list</Text>
            </View>
            <PixelIcon name="chevron" size={12} color={PP.muted} />
          </Pressable>
        </HardShadow>
      </View>

      <TemplateManagerModal
        visible={showManager}
        onClose={() => setShowManager(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PP.paper },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 14,
    backgroundColor: PP.panel, borderWidth: PP_BORDER.thick, borderColor: PP.ink,
  },
});
