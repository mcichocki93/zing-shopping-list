import React, { useState } from 'react';
import { Text, ScrollView, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PixelButton, PixelInput, PixelCard } from '../../../components/ui';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, TOUCH } from '../../../constants';
import { useAuth } from '../hooks';
import type { AuthStackParamList } from '../../../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { handleSignUp, isLoading, error } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const onSubmit = () => {
    setLocalError(null);

    if (!displayName.trim()) {
      setLocalError('Podaj nazwę użytkownika.');
      return;
    }
    if (!email.trim()) {
      setLocalError('Podaj adres email.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Hasło musi mieć min. 6 znaków.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Hasła nie są identyczne.');
      return;
    }

    handleSignUp(email.trim(), password, displayName.trim());
  };

  const displayedError = localError || error;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Zing</Text>
          <Text style={styles.subtitle}>Utwórz konto</Text>

          <PixelCard style={styles.card}>
            {displayedError && <Text style={styles.error}>{displayedError}</Text>}

            <PixelInput
              placeholder="Nazwa użytkownika"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              textContentType="name"
              style={styles.input}
            />

            <PixelInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              style={styles.input}
            />

            <PixelInput
              placeholder="Hasło"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="newPassword"
              style={styles.input}
            />

            <PixelInput
              placeholder="Powtórz hasło"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              textContentType="newPassword"
              style={styles.input}
            />

            <PixelButton
              title={isLoading ? 'Rejestracja...' : 'Zarejestruj'}
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
            <Text style={styles.linkText}>Masz już konto? Zaloguj się</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.primary,
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
  input: {
    width: '100%',
  },
  error: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.caption,
    textAlign: 'center',
  },
  linkButton: {
    marginTop: SPACING.md,
    minHeight: TOUCH.minTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    color: COLORS.accent,
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
  },
});
