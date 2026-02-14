import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PixelButton, PixelInput, PixelCard } from '../../../components/ui';
import { COLORS, SPACING } from '../../../constants';
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
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
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

        <PixelButton
          title="Masz już konto? Zaloguj się"
          onPress={() => navigation.navigate('Login')}
          variant="primary"
          style={styles.linkButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
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
    fontSize: 14,
    textAlign: 'center',
  },
  linkButton: {
    marginTop: SPACING.md,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
});
