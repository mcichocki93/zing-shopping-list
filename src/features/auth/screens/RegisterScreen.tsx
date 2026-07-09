import React, { useState } from 'react';
import { Text, ScrollView, Pressable, StyleSheet, KeyboardAvoidingView, Platform, View, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PixelButton, PixelInput, PixelCard } from '../../../components/ui';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, TOUCH } from '../../../constants';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../hooks';
import { PP, PP_BORDER, PP_FONT, ppText } from '../../../constants/pixelPopTheme';
import { HardShadow, PixelIcon } from '../../../components/ui-pixelpop';
import type { AuthStackParamList } from '../../../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { theme, pixelPopEnabled, pixelPopAccent } = useTheme();
  const { handleSignUp, isLoading, error } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const onSubmit = () => {
    setLocalError(null);
    if (!displayName.trim()) { setLocalError(t('auth.errUsername')); return; }
    if (!email.trim()) { setLocalError(t('auth.errEmail')); return; }
    if (password.length < 6) { setLocalError(t('auth.errPasswordShort')); return; }
    if (password !== confirmPassword) { setLocalError(t('auth.errPasswordMismatch')); return; }
    handleSignUp(email.trim(), password, displayName.trim());
  };

  const displayedError = localError || error;

  if (pixelPopEnabled) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: PP.paper }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={pp.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <View style={pp.logoRow}>
              <HardShadow offset={4}>
                <View style={[pp.logoBox, { backgroundColor: pixelPopAccent }]}>
                  <PixelIcon name="logo" size={24} color={PP.ink} />
                </View>
              </HardShadow>
              <Text style={[ppText.brand, { marginLeft: 12 }]}>ZING</Text>
            </View>

            <Text style={[ppText.title, { textAlign: 'center', marginBottom: 4 }]}>{t('auth.registerTitle')}</Text>
            <Text style={[ppText.meta, { textAlign: 'center', marginBottom: 28 }]}>{t('auth.registerTagline')}</Text>

            <HardShadow offset={4}>
              <View style={pp.card}>
                {displayedError ? <Text style={pp.error}>{displayedError}</Text> : null}

                <Text style={ppText.catLabel}>{t('auth.username')}</Text>
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Jan Kowalski"
                  placeholderTextColor={PP.muted}
                  autoCapitalize="words"
                  textContentType="name"
                  style={pp.input}
                />

                <Text style={[ppText.catLabel, { marginTop: 12 }]}>{t('auth.email')}</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="twoj@email.com"
                  placeholderTextColor={PP.muted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  style={pp.input}
                />

                <Text style={[ppText.catLabel, { marginTop: 12 }]}>{t('auth.password')}</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={PP.muted}
                  secureTextEntry
                  textContentType="newPassword"
                  style={pp.input}
                />

                <Text style={[ppText.catLabel, { marginTop: 12 }]}>{t('auth.confirmPassword')}</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor={PP.muted}
                  secureTextEntry
                  textContentType="newPassword"
                  style={pp.input}
                />

                <HardShadow offset={3}>
                  <Pressable
                    onPress={onSubmit}
                    disabled={isLoading}
                    style={[pp.btn, { backgroundColor: pixelPopAccent, opacity: isLoading ? 0.6 : 1, marginTop: 16 }]}
                    accessibilityLabel={t('auth.registerA11y')}
                  >
                    <Text style={pp.btnText}>{isLoading ? t('auth.registering') : t('auth.registerBtn')}</Text>
                  </Pressable>
                </HardShadow>
              </View>
            </HardShadow>

            <Pressable
              onPress={() => navigation.navigate('Login')}
              style={pp.linkRow}
              accessibilityLabel={t('auth.haveAccountA11y')}
            >
              <Text style={ppText.meta}>
                {t('auth.haveAccount')}{' '}
                <Text style={{ color: pixelPopAccent, fontFamily: PP_FONT.uiBold }}>{t('auth.loginLink')}</Text>
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.accentLight }]}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: theme.accent }]}>LISTA ZAKUPÓW</Text>
          <Text style={styles.subtitle}>Twoja pixelowa lista.</Text>

          <PixelCard style={styles.card}>
            {displayedError && <Text style={styles.error}>{displayedError}</Text>}

            <PixelInput
              label="Nazwa użytkownika"
              placeholder="Jan Kowalski"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              textContentType="name"
              leftIcon={<MaterialCommunityIcons name="account-outline" size={20} color={COLORS.disabled} />}
            />

            <PixelInput
              label="Email"
              placeholder="twoj@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              leftIcon={<MaterialCommunityIcons name="email-outline" size={20} color={COLORS.disabled} />}
            />

            <PixelInput
              label="Hasło"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="newPassword"
              leftIcon={<MaterialCommunityIcons name="lock-outline" size={20} color={COLORS.disabled} />}
            />

            <PixelInput
              label="Powtórz hasło"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              textContentType="newPassword"
              leftIcon={<MaterialCommunityIcons name="lock-outline" size={20} color={COLORS.disabled} />}
            />

            <PixelButton
              title={isLoading ? 'Rejestracja...' : 'Zarejestruj się'}
              onPress={onSubmit}
              disabled={isLoading}
            />
          </PixelCard>

          <Pressable
            onPress={() => navigation.navigate('Login')}
            accessibilityRole="button"
            accessibilityLabel="Masz już konto? Zaloguj się"
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>
              Masz już konto? <Text style={[styles.linkTextBold, { color: theme.accent }]}>Zaloguj się</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Pixel Pop styles ────────────────────────────────────────────────────────

const pp = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 32 },
  logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  logoBox: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderWidth: PP_BORDER.thick, borderColor: PP.ink, transform: [{ rotate: '-4deg' }] },
  card: { backgroundColor: PP.panel, borderWidth: PP_BORDER.thick, borderColor: PP.ink, padding: 18, gap: 0 },
  error: { fontFamily: PP_FONT.uiSemi, fontSize: 12, color: '#FF3B30', marginBottom: 10, textAlign: 'center' },
  input: {
    backgroundColor: PP.paper, borderWidth: PP_BORDER.base, borderColor: PP.ink,
    paddingHorizontal: 12, paddingVertical: 11, fontFamily: PP_FONT.ui, fontSize: 13,
    color: PP.ink, marginTop: 6,
  },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderWidth: PP_BORDER.thick, borderColor: PP.ink,
  },
  btnText: { fontFamily: PP_FONT.display, fontSize: 11, color: PP.ink },
  linkRow: { marginTop: 24, alignItems: 'center', minHeight: 44, justifyContent: 'center' },
});

// ─── Legacy styles ───────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  wrapper: { flex: 1 },
  scrollContent: {
    flexGrow: 1, justifyContent: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.lg,
  },
  title: { fontSize: FONT_SIZE.display, fontWeight: FONT_WEIGHT.black, textAlign: 'center', marginBottom: SPACING.xs },
  subtitle: { fontSize: FONT_SIZE.body, color: COLORS.disabled, textAlign: 'center', marginBottom: SPACING.lg },
  card: { gap: SPACING.sm },
  error: { color: COLORS.danger, fontSize: FONT_SIZE.caption, textAlign: 'center' },
  linkButton: { marginTop: SPACING.md, minHeight: TOUCH.minTarget, alignItems: 'center', justifyContent: 'center' },
  linkText: { color: COLORS.disabled, fontSize: FONT_SIZE.body, textAlign: 'center' },
  linkTextBold: { fontWeight: FONT_WEIGHT.bold },
});
