import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PixelModal } from '../../../components/ui/PixelModal';
import { PixelButton } from '../../../components/ui/PixelButton';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../../../constants';
import { purchasePremium, restorePurchases } from '../services/iap';

interface PremiumGateModalProps {
  visible: boolean;
  onClose: () => void;
  /** If true, modal explains the limit was hit; otherwise just shows upsell */
  limitReached?: boolean;
}

export function PremiumGateModal({ visible, onClose, limitReached = false }: PremiumGateModalProps) {
  const { t } = useTranslation();
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
        setError(t('premium.purchaseFailed'));
      }
    } catch {
      setError(t('premium.purchaseError'));
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
        Alert.alert(t('premium.noPurchaseTitle'), t('premium.noPurchaseBody'));
      }
    } catch {
      setError(t('premium.restoreFailed'));
    } finally {
      setIsRestoring(false);
    }
  }

  const isBusy = isPurchasing || isRestoring;

  return (
    <PixelModal
      visible={visible}
      onClose={onClose}
      title={limitReached ? t('premium.titleGate') : t('premium.title')}
    >
      <View style={styles.container}>
        {limitReached ? (
          <Text style={styles.body}>
            {t('premium.bodyGate')}
          </Text>
        ) : (
          <Text style={styles.body}>{t('premium.bodyDefault')}</Text>
        )}

        <View style={styles.featureList}>
          <FeatureRow label={t('premium.featureAi')} free={false} />
          <FeatureRow label={t('premium.featureTemplates')} free={false} />
          <FeatureRow label={t('premium.featureCategories')} free={false} />
          <FeatureRow label={t('premium.featureUnlimitedLists')} free={true} />
          <FeatureRow label={t('premium.featureFullList')} free={true} />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        {isBusy ? (
          <ActivityIndicator color={COLORS.primary} style={styles.loader} />
        ) : (
          <View style={styles.buttons}>
            <PixelButton
              title={t('premium.buy')}
              onPress={handlePurchase}
              variant="primary"
            />
            <PixelButton
              title={t('premium.restore')}
              onPress={handleRestore}
              variant="accentMuted"
            />
            <PixelButton
              title={t('premium.later')}
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
  const { t } = useTranslation();
  return (
    <View style={styles.featureRow}>
      <Text style={[styles.featureDot, free ? styles.freeColor : styles.premiumColor]}>
        {free ? '○' : '★'}
      </Text>
      <Text style={styles.featureLabel}>{label}</Text>
      <Text style={[styles.featureBadge, free ? styles.freeColor : styles.premiumColor]}>
        {free ? t('premium.badgeFree') : t('premium.badgePremium')}
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
