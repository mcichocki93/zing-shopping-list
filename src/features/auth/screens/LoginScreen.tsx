import React, { useState } from 'react';
import { Text, ScrollView, Pressable, View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PixelButton, PixelInput, PixelCard } from '../../../components/ui';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, TOUCH, BORDERS } from '../../../constants';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../hooks';
import type { AuthStackParamList } from '../../../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { theme } = useTheme();
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
      Alert.alert('Uwaga', 'Wpisz adres email, a następnie kliknij "Nie pamiętam hasła".');
      return;
    }
    handleResetPassword(trimmed);
  };

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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.display,
    fontWeight: FONT_WEIGHT.black,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.body,
    color: COLORS.disabled,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  card: {
    gap: SPACING.sm,
  },
  error: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.caption,
    textAlign: 'center',
  },
  forgotRow: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.bold,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  dividerLine: {
    flex: 1,
    height: BORDERS.width,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SPACING.sm,
    fontSize: FONT_SIZE.caption,
    color: COLORS.disabled,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    minHeight: TOUCH.minTarget,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
  },
  socialButtonText: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  appleButton: {
    width: '100%',
    height: TOUCH.minTarget,
  },
  linkButton: {
    marginTop: SPACING.md,
    minHeight: TOUCH.minTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    color: COLORS.disabled,
    fontSize: FONT_SIZE.body,
    textAlign: 'center',
  },
  linkTextBold: {
    fontWeight: FONT_WEIGHT.bold,
  },
});
