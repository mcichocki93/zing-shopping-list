import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { PixelModal } from '../../../components/ui/PixelModal';
import { PixelButton } from '../../../components/ui/PixelButton';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../../../constants';
import { AI_FREE_DAILY_LIMIT } from '../../../types/user';
import { purchasePremium, restorePurchases } from '../services/iap';

interface PremiumGateModalProps {
  visible: boolean;
  onClose: () => void;
  /** If true, modal explains the limit was hit; otherwise just shows upsell */
  limitReached?: boolean;
}

export function PremiumGateModal({ visible, onClose, limitReached = false }: PremiumGateModalProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePurchase() {
    setIsPurchasing(true);
    setError(null);
    try {
      const result = await purchasePremium();
      if (result === 'success') {
        // isPremium is updated via Firestore listener — just close
        onClose();
      } else if (result === 'cancelled') {
        // user backed out — do nothing
      } else {
        setError('Zakup nie powiódł się. Spróbuj ponownie.');
      }
    } catch {
      setError('Błąd podczas zakupu. Sprawdź połączenie.');
    } finally {
      setIsPurchasing(false);
    }
  }

  async function handleRestore() {
    setIsRestoring(true);
    setError(null);
    try {
      const restored = await restorePurchases();
      if (restored) {
        onClose();
      } else {
        Alert.alert('Brak zakupu', 'Nie znaleziono aktywnej subskrypcji dla tego konta.');
      }
    } catch {
      setError('Nie udało się przywrócić zakupu.');
    } finally {
      setIsRestoring(false);
    }
  }

  const isBusy = isPurchasing || isRestoring;

  return (
    <PixelModal
      visible={visible}
      onClose={onClose}
      title={limitReached ? 'Limit AI osiągnięty' : 'Zing Premium'}
    >
      <View style={styles.container}>
        {limitReached ? (
          <Text style={styles.body}>
            Wykorzystałeś dzienny limit AI ({AI_FREE_DAILY_LIMIT} wywołanie/24h).
          </Text>
        ) : (
          <Text style={styles.body}>Odblokuj pełne możliwości Zing!</Text>
        )}

        <View style={styles.featureList}>
          <FeatureRow label="Nieograniczone AI" free={false} />
          <FeatureRow label={`${AI_FREE_DAILY_LIMIT} wywołanie AI / dzień`} free={true} />
          <FeatureRow label="Szablony list" free={false} />
          <FeatureRow label="Niestandardowe kategorie" free={false} />
          <FeatureRow label="Pełna lista zakupów" free={true} />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        {isBusy ? (
          <ActivityIndicator color={COLORS.primary} style={styles.loader} />
        ) : (
          <View style={styles.buttons}>
            <PixelButton
              title="Kup Premium"
              onPress={handlePurchase}
              variant="primary"
            />
            <PixelButton
              title="Przywróć zakup"
              onPress={handleRestore}
              variant="accentMuted"
            />
            <PixelButton
              title="Może później"
              onPress={onClose}
              variant="accentMuted"
            />
          </View>
        )}
      </View>
    </PixelModal>
  );
}

function FeatureRow({ label, free }: { label: string; free: boolean }) {
  return (
    <View style={styles.featureRow}>
      <Text style={[styles.featureDot, free ? styles.freeColor : styles.premiumColor]}>
        {free ? '○' : '★'}
      </Text>
      <Text style={styles.featureLabel}>{label}</Text>
      <Text style={[styles.featureBadge, free ? styles.freeColor : styles.premiumColor]}>
        {free ? 'Darmowe' : 'Premium'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
  },
  body: {
    fontSize: FONT_SIZE.body,
    color: COLORS.primary,
  },
  featureList: {
    gap: SPACING.xs,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: SPACING.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  featureDot: {
    fontSize: FONT_SIZE.body,
    width: 20,
  },
  featureLabel: {
    flex: 1,
    fontSize: FONT_SIZE.body,
    color: COLORS.primary,
  },
  featureBadge: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.bold,
  },
  freeColor: {
    color: COLORS.disabled,
  },
  premiumColor: {
    color: COLORS.primary,
  },
  buttons: {
    gap: SPACING.sm,
  },
  loader: {
    marginVertical: SPACING.sm,
  },
  error: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.danger,
  },
});
