import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { PixelModal } from '../../../components/ui/PixelModal';
import { PixelButton } from '../../../components/ui/PixelButton';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../../../constants';
import { AI_FREE_LIMIT } from '../../../types/user';
import { purchasePremium } from '../services/iap';
import { grantPremium } from '../hooks/usePremium';
import { useAuth } from '../../auth/hooks/useAuth';

interface PremiumGateModalProps {
  visible: boolean;
  onClose: () => void;
  /** If true, modal explains the limit was hit; otherwise just shows upsell */
  limitReached?: boolean;
}

export function PremiumGateModal({ visible, onClose, limitReached = false }: PremiumGateModalProps) {
  const { user } = useAuth();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePurchase() {
    if (!user) return;
    setIsPurchasing(true);
    setError(null);
    try {
      const result = await purchasePremium();
      if (result === 'success') {
        await grantPremium(user.id);
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

  return (
    <PixelModal
      visible={visible}
      onClose={onClose}
      title={limitReached ? '⚠️ Limit AI osiągnięty' : '✨ Zing Premium'}
    >
      <View style={styles.container}>
        {limitReached ? (
          <Text style={styles.body}>
            Wykorzystałeś {AI_FREE_LIMIT} bezpłatnych wywołań AI na ten miesiąc.
          </Text>
        ) : (
          <Text style={styles.body}>Odblokuj pełne możliwości Zing!</Text>
        )}

        <View style={styles.featureList}>
          <FeatureRow label="Nieograniczone AI" free={false} />
          <FeatureRow label={`${AI_FREE_LIMIT} wywołań AI / miesiąc`} free={true} />
          <FeatureRow label="Brak reklam" free={false} />
          <FeatureRow label="Pełna lista zakupów" free={true} />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        {isPurchasing ? (
          <ActivityIndicator color={COLORS.primary} style={styles.loader} />
        ) : (
          <View style={styles.buttons}>
            <PixelButton
              title="Kup Premium"
              onPress={handlePurchase}
              variant="primary"
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
    color: COLORS.text,
  },
  featureList: {
    gap: SPACING.xs,
    backgroundColor: COLORS.backgroundSecondary ?? '#f5f5f5',
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
    color: COLORS.text,
  },
  featureBadge: {
    fontSize: FONT_SIZE.small,
    fontWeight: FONT_WEIGHT.bold,
  },
  freeColor: {
    color: COLORS.textSecondary ?? '#888',
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
    fontSize: FONT_SIZE.small,
    color: COLORS.danger,
  },
});
