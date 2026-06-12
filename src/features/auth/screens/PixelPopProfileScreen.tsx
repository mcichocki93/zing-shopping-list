import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PP, PP_BORDER, PP_FONT, ppText } from '../../../constants/pixelPopTheme';
import { HardShadow, PixelIcon } from '../../../components/ui-pixelpop';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../../../contexts/ThemeContext';
import { CategoryManagerModal } from '../../categories';

const ACCENT_COLORS = [
  { key: 'pink',   color: PP.pink },
  { key: 'yellow', color: PP.yellow },
  { key: 'violet', color: PP.violet },
  { key: 'cyan',   color: PP.cyan },
];

export function PixelPopProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, handleSignOut, handleDeleteAccount, isLoading } = useAuth();
  const { pixelPopAccent, setPixelPopAccent } = useTheme();
  const [showCategories, setShowCategories] = React.useState(false);

  const onDeleteAccount = () => {
    Alert.alert(
      'Usuń konto',
      'Spowoduje to trwałe usunięcie Twojego konta i wszystkich danych. Tej operacji nie można cofnąć.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń konto',
          style: 'destructive',
          onPress: handleDeleteAccount,
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
        <Text style={ppText.title}>Profil</Text>
        {user?.displayName ? (
          <Text style={[ppText.meta, { marginTop: 4 }]}>{user.displayName}</Text>
        ) : null}
        {user?.email ? (
          <Text style={[ppText.meta, { marginTop: 2 }]}>{user.email}</Text>
        ) : null}
      </View>

      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        <HardShadow offset={4}>
          <View style={styles.block}>
            <SettingsRow icon="gear" label="Zarządzaj kategoriami" onPress={() => setShowCategories(true)} />
            <View style={styles.divider} />
            {/* Pixel Pop accent color picker */}
            <View style={styles.accentRow}>
              <PixelIcon name="template" size={16} color={PP.ink} />
              <Text style={[ppText.rowBody, { flex: 1 }]}>Kolor akcentu</Text>
              <View style={styles.swatches}>
                {ACCENT_COLORS.map(({ key, color }) => (
                  <Pressable
                    key={key}
                    onPress={() => setPixelPopAccent(color)}
                    accessibilityLabel={`Akcent: ${key}`}
                    style={[
                      styles.swatch,
                      { backgroundColor: color },
                      pixelPopAccent === color && styles.swatchActive,
                    ]}
                  >
                    {pixelPopAccent === color && (
                      <Text style={styles.swatchCheck}>✓</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.divider} />
            <SettingsRow
              icon="share"
              label="Polityka prywatności"
              onPress={() => Linking.openURL('https://mcichocki93.github.io/zing-shopping-list/privacy-policy')}
            />
            <View style={styles.divider} />
            <SettingsRow
              icon="trash"
              label="Usuń konto (przez stronę)"
              onPress={() => Linking.openURL('https://mcichocki93.github.io/zing-shopping-list/delete-account')}
            />
          </View>
        </HardShadow>

        <HardShadow offset={4}>
          <Pressable
            onPress={handleSignOut}
            style={[styles.btn, { backgroundColor: PP.ink }]}
            accessibilityLabel="Wyloguj się"
          >
            <Text style={{ fontFamily: PP_FONT.display, fontSize: 12, color: PP.paper }}>WYLOGUJ</Text>
          </Pressable>
        </HardShadow>

        <HardShadow offset={4}>
          <Pressable
            onPress={onDeleteAccount}
            style={[styles.btn, { backgroundColor: '#FF3B30' }]}
            accessibilityLabel="Usuń konto"
            disabled={isLoading}
          >
            <Text style={{ fontFamily: PP_FONT.display, fontSize: 12, color: PP.paper }}>
              {isLoading ? 'USUWANIE...' : 'USUŃ KONTO'}
            </Text>
          </Pressable>
        </HardShadow>
      </View>

      <CategoryManagerModal visible={showCategories} onClose={() => setShowCategories(false)} />
    </View>
  );
}

function SettingsRow({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.row} accessibilityLabel={label}>
      <PixelIcon name={icon} size={16} color={PP.ink} />
      <Text style={[ppText.rowBody, { flex: 1 }]}>{label}</Text>
      <PixelIcon name="chevron" size={12} color={PP.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PP.paper },
  block: { backgroundColor: PP.panel, borderWidth: PP_BORDER.thick, borderColor: PP.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14, minHeight: 48 },
  divider: { height: 2, backgroundColor: PP.paper },
  btn: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderWidth: PP_BORDER.thick, borderColor: PP.ink,
  },
  accentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, minHeight: 48 },
  swatches: { flexDirection: 'row', gap: 8 },
  swatch: { width: 28, height: 28, borderWidth: PP_BORDER.thick, borderColor: PP.ink, alignItems: 'center', justifyContent: 'center' },
  swatchActive: { borderWidth: PP_BORDER.thick + 1, borderColor: PP.ink },
  swatchCheck: { fontFamily: PP_FONT.uiBold, fontSize: 14, color: PP.ink },
});
