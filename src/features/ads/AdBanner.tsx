import React from 'react';
import { View, StyleSheet } from 'react-native';
import { usePremium } from '../premium/hooks/usePremium';
import { BANNER_UNIT_ID } from './constants';

// Defensive native import — unavailable in Expo Go / older dev builds.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let BannerAd: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let BannerAdSize: any = null;
try {
  const mod = require('react-native-google-mobile-ads');
  BannerAd = mod.BannerAd;
  BannerAdSize = mod.BannerAdSize;
} catch {
  /* native module not available */
}

/**
 * Anchored adaptive banner shown only to free users. Renders nothing for
 * Premium users or when the native ads module is unavailable.
 */
export function AdBanner() {
  const { isPremium } = usePremium();
  if (isPremium || !BannerAd || !BannerAdSize) return null;

  return (
    <View style={styles.wrap}>
      <BannerAd
        unitId={BANNER_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});

export default AdBanner;
