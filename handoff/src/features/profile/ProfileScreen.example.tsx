// ProfileScreen.example.tsx — ekran „Profil" w stylu Pixel Pop (zakładka bottom tabs).
// Docelowo: src/features/profile/screens/ProfileScreen.tsx (nowy) lub przenieś tu ustawienia.
// Podłącz pod useAuth() + istniejące akcje (wyloguj, usuń konto, motyw, kategorie, polityka).

import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PP, PP_BORDER, ppText } from '../../../constants/pixelPopTheme';
import { HardShadow, PixelIcon } from '../../../components/ui-pixelpop';

interface Row { icon: string; label: string; onPress: () => void; danger?: boolean; }

export function ProfileScreen({
  displayName = 'Marcin',
  email = '',
  accent = PP.pink,
  onManageCategories,
  onManageTemplates,
  onChangeTheme,
  onSignOut,
  onDeleteAccount,
}: {
  displayName?: string;
  email?: string;
  accent?: string;
  onManageCategories?: () => void;
  onManageTemplates?: () => void;
  onChangeTheme?: () => void;
  onSignOut?: () => void;
  onDeleteAccount?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const rows: Row[] = [
    { icon: 'star', label: 'Zarządzaj kategoriami', onPress: onManageCategories ?? (() => {}) },
    { icon: 'template', label: 'Szablony list', onPress: onManageTemplates ?? (() => {}) },
    { icon: 'gear', label: 'Motyw i kolor akcentu', onPress: onChangeTheme ?? (() => {}) },
    { icon: 'share', label: 'Polityka prywatności', onPress: () => Linking.openURL('https://mcichocki93.github.io/zing-shopping-list/privacy-policy') },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: PP.paper }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 110 }}>
        {/* Karta profilu */}
        <View style={{ paddingHorizontal: 16 }}>
          <HardShadow offset={5}>
            <View style={[styles.profile, { backgroundColor: accent }]}>
              <View style={styles.avatar}>
                <Text style={[ppText.heroNum, { fontSize: 28 }]}>{displayName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[ppText.title, { fontSize: 22 }]}>{displayName}</Text>
                {!!email && <Text style={[ppText.meta, { color: PP.ink, opacity: 0.8, marginTop: 2 }]}>{email}</Text>}
              </View>
            </View>
          </HardShadow>
        </View>

        {/* Lista ustawień */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <HardShadow offset={4}>
            <View style={styles.block}>
              {rows.map((r, i) => (
                <Pressable key={r.label} onPress={r.onPress} style={[styles.row, i < rows.length - 1 && styles.rowDivider]}>
                  <View style={styles.rowTile}><PixelIcon name={r.icon} size={14} color={PP.ink} /></View>
                  <Text style={[ppText.rowBody, { flex: 1 }]}>{r.label}</Text>
                  <PixelIcon name="chevron" size={12} color={PP.muted} />
                </Pressable>
              ))}
            </View>
          </HardShadow>
        </View>

        {/* Akcje konta */}
        <View style={{ paddingHorizontal: 16, marginTop: 16, gap: 10 }}>
          <Pressable onPress={onSignOut} style={[styles.action, { backgroundColor: PP.yellow }]}>
            <Text style={ppText.segment}>WYLOGUJ</Text>
          </Pressable>
          <Pressable onPress={onDeleteAccount} style={[styles.action, { backgroundColor: PP.ink }]}>
            <Text style={[ppText.segment, { color: PP.paper }]}>USUŃ KONTO</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: PP_BORDER.thick, borderColor: PP.ink, padding: 16 },
  avatar: { width: 56, height: 56, backgroundColor: PP.paper, borderWidth: PP_BORDER.thick, borderColor: PP.ink, alignItems: 'center', justifyContent: 'center' },
  block: { backgroundColor: PP.panel, borderWidth: PP_BORDER.thick, borderColor: PP.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 14, minHeight: 44 },
  rowDivider: { borderBottomWidth: 2, borderBottomColor: PP.paper, borderStyle: 'dashed' },
  rowTile: { width: 26, height: 26, backgroundColor: PP.paper, borderWidth: PP_BORDER.thin, borderColor: PP.ink, alignItems: 'center', justifyContent: 'center' },
  action: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderWidth: PP_BORDER.thick, borderColor: PP.ink },
});

export default ProfileScreen;
