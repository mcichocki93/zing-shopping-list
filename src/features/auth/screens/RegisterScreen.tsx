import React, { useState } from 'react';
import { Text, ScrollView, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PixelButton, PixelInput, PixelCard } from '../../../components/ui';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, TOUCH } from '../../../constants';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../hooks';
import type { AuthStackParamList } from '../../../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { handleSignUp, isLoading, error } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const onSubmit = () => {
    setLocalError(null);
    if (!displayName.trim()) { setLocalError('Podaj nazwę użytkownika.'); return; }
    if (!email.trim()) { setLocalError('Podaj adres email.'); return; }
    if (password.length < 6) { setLocalError('Hasło musi mieć min. 6 znaków.'); return; }
    if (password !== confirmPassword) { setLocalError('Hasła nie są identyczne.'); return; }
    handleSignUp(email.trim(), password, displayName.trim());
  };

  const displayedError = localError || error;

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
