import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PixelButton, PixelInput, PixelCard } from '../../../components/ui';
import { COLORS, SPACING } from '../../../constants';
import { useAuth } from '../hooks';
import type { AuthStackParamList } from '../../../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { handleSignIn, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = () => {
    if (!email.trim() || !password) return;
    handleSignIn(email.trim(), password);
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Zing</Text>
        <Text style={styles.subtitle}>Zaloguj się</Text>

        <PixelCard style={styles.card}>
          {error && <Text style={styles.error}>{error}</Text>}

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
            textContentType="password"
            style={styles.input}
          />

          <PixelButton
            title={isLoading ? 'Logowanie...' : 'Zaloguj'}
            onPress={onSubmit}
            disabled={isLoading}
          />
        </PixelCard>

        <PixelButton
          title="Nie masz konta? Zarejestruj się"
          onPress={() => navigation.navigate('Register')}
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
