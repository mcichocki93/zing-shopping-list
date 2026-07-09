import React, { useState } from 'react';
import { Text, ScrollView, Pressable, View, StyleSheet, KeyboardAvoidingView, Platform, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PixelButton, PixelInput, PixelCard } from '../../../components/ui';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, TOUCH, BORDERS } from '../../../constants';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../hooks';
import { PP, PP_BORDER, PP_FONT, ppText } from '../../../constants/pixelPopTheme';
import { HardShadow, PixelIcon } from '../../../components/ui-pixelpop';
import type { AuthStackParamList } from '../../../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { theme, pixelPopEnabled, pixelPopAccent } = useTheme();
  const { handleSignIn, handleSignInWithGoogle, handleSignInWithApple, handleResetPassword, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = () => {
    if (!email.trim() || !password) return;
    handleSignIn(email.trim(), password);
  };

  const onForgotPassword = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert(t('auth.forgotEmailTitle'), t('auth.forgotEmailBody'));
      return;
    }
    handleResetPassword(trimmed);
  };

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

            <Text style={[ppText.title, { textAlign: 'center', marginBottom: 4 }]}>{t('auth.title')}</Text>
            <Text style={[ppText.meta, { textAlign: 'center', marginBottom: 28 }]}>{t('auth.tagline')}</Text>

            <HardShadow offset={4}>
              <View style={pp.card}>
                {error ? <Text style={pp.error}>{error}</Text> : null}

                <Text style={ppText.catLabel}>{t('auth.email')}</Text>
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
                  textContentType="password"
                  style={pp.input}
                />

                <Pressable onPress={onForgotPassword} style={pp.forgotRow} accessibilityLabel={t('auth.forgotPassword')}>
                  <Text style={[ppText.meta, { color: pixelPopAccent }]}>{t('auth.forgotPassword')}</Text>
                </Pressable>

                <HardShadow offset={3}>
                  <Pressable
                    onPress={onSubmit}
                    disabled={isLoading}
                    style={[pp.btn, { backgroundColor: pixelPopAccent, opacity: isLoading ? 0.6 : 1 }]}
                    accessibilityLabel={t('auth.loginA11y')}
                  >
                    <Text style={pp.btnText}>{isLoading ? t('auth.loggingIn') : t('auth.login')}</Text>
                  </Pressable>
                </HardShadow>

                <View style={pp.divRow}>
                  <View style={pp.divLine} />
                  <Text style={[ppText.meta, { marginHorizontal: 10 }]}>{t('auth.or')}</Text>
                  <View style={pp.divLine} />
                </View>

                <HardShadow offset={3}>
                  <Pressable
                    onPress={handleSignInWithGoogle}
                    disabled={isLoading}
                    style={[pp.btn, { backgroundColor: PP.paper, opacity: isLoading ? 0.6 : 1 }]}
                    accessibilityLabel="Kontynuuj z Google"
                  >
                    <MaterialCommunityIcons name="google" size={14} color="#DB4437" />
                    <Text style={[pp.btnText, { marginLeft: 6 }]}>{t('auth.continueGoogle')}</Text>
                  </Pressable>
                </HardShadow>

                {Platform.OS === 'ios' && (
                  <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                    cornerRadius={0}
                    style={pp.appleBtn}
                    onPress={handleSignInWithApple}
                  />
                )}
              </View>
            </HardShadow>

            <Pressable
              onPress={() => navigation.navigate('Register')}
              style={pp.linkRow}
              accessibilityLabel={t('auth.noAccountA11y')}
            >
              <Text style={ppText.meta}>
                {t('auth.noAccount')}{' '}
                <Text style={{ color: pixelPopAccent, fontFamily: PP_FONT.uiBold }}>{t('auth.register')}</Text>
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
            {error && <Text style={styles.error}>{error}</Text>}

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
              textContentType="password"
              leftIcon={<MaterialCommunityIcons name="lock-outline" size={20} color={COLORS.disabled} />}
            />

            <Pressable
              onPress={onForgotPassword}
              accessibilityRole="button"
              accessibilityLabel="Nie pamiętam hasła"
              style={styles.forgotRow}
            >
              <Text style={[styles.forgotText, { color: theme.accent }]}>Nie pamiętam hasła</Text>
            </Pressable>

            <PixelButton
              title={isLoading ? 'Logowanie...' : 'Zaloguj się'}
              onPress={onSubmit}
              disabled={isLoading}
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>lub</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              onPress={handleSignInWithGoogle}
              disabled={isLoading}
              style={[styles.socialButton, { opacity: isLoading ? 0.5 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel="Zaloguj się przez Google"
            >
              <MaterialCommunityIcons name="google" size={20} color="#DB4437" />
              <Text style={styles.socialButtonText}>Kontynuuj z Google</Text>
            </Pressable>

            {Platform.OS === 'ios' && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={0}
                style={styles.appleButton}
                onPress={handleSignInWithApple}
              />
            )}
          </PixelCard>

          <Pressable
            onPress={() => navigation.navigate('Register')}
            accessibilityRole="button"
            accessibilityLabel="Nie masz konta? Zarejestruj się"
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>
              Nie masz konta? <Text style={[styles.linkTextBold, { color: theme.accent }]}>Zarejestruj się</Text>
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
  forgotRow: { alignSelf: 'flex-end', paddingVertical: 8, marginBottom: 6 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderWidth: PP_BORDER.thick, borderColor: PP.ink, marginTop: 8,
  },
  btnText: { fontFamily: PP_FONT.display, fontSize: 11, color: PP.ink },
  divRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 14 },
  divLine: { flex: 1, height: PP_BORDER.thin, backgroundColor: PP.ink },
  appleBtn: { width: '100%', height: 48, marginTop: 8 },
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
  forgotRow: { alignSelf: 'flex-end' },
  forgotText: { fontSize: FONT_SIZE.caption, fontWeight: FONT_WEIGHT.bold },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.xs },
  dividerLine: { flex: 1, height: BORDERS.width, backgroundColor: COLORS.border },
  dividerText: { marginHorizontal: SPACING.sm, fontSize: FONT_SIZE.caption, color: COLORS.disabled },
  socialButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    minHeight: TOUCH.minTarget, borderWidth: BORDERS.width, borderColor: COLORS.border,
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.md,
  },
  socialButtonText: { fontSize: FONT_SIZE.body, fontWeight: FONT_WEIGHT.bold, color: COLORS.primary },
  appleButton: { width: '100%', height: TOUCH.minTarget },
  linkButton: { marginTop: SPACING.md, minHeight: TOUCH.minTarget, alignItems: 'center', justifyContent: 'center' },
  linkText: { color: COLORS.disabled, fontSize: FONT_SIZE.body, textAlign: 'center' },
  linkTextBold: { fontWeight: FONT_WEIGHT.bold },
});
