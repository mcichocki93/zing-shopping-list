import React, { useState } from 'react';
import { Text, ScrollView, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PixelButton, PixelInput, PixelCard } from '../../../components/ui';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, TOUCH } from '../../../constants';
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

          <Pressable
            onPress={() => navigation.navigate('Register')}
            accessibilityRole="button"
            accessibilityLabel="Nie masz konta? Zarejestruj się"
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>Nie masz konta? Zarejestruj się</Text>
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
