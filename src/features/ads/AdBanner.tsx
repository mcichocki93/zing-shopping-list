import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

// ── Layout constants (mierzone od insets.bottom) ──────────────────────────
// Pływający tab bar (PixelPopTabBar) zajmuje wizualnie ~insets.bottom → +80.
// Baner kotwiczymy nad nim z odstępem; treść ekranu paddujemy tak, by ostatni
// element nie chował się za banerem/belką.
const ANCHOR_BOTTOM = 88;            // dolny offset banera (nad belką)
export const AD_CONTENT_PAD_WITH_AD = 160; // paddingBottom treści gdy baner widoczny (free)
export const AD_CONTENT_PAD_NO_AD = 96;    // paddingBottom treści bez banera (premium)

/**
 * Zwraca paddingBottom, jaki lista/scroll powinny mieć, by wyczyścić belkę
 * i (dla free) baner. Dodaj do insets.bottom.
 */
export function adContentPad(isPremium: boolean): number {
  return isPremium ? AD_CONTENT_PAD_NO_AD : AD_CONTENT_PAD_WITH_AD;
}

/**
 * Raw adaptive banner (bez pozycjonowania). Renderuje nic dla Premium lub gdy
 * moduł natywny jest niedostępny.
 */
export function AdBanner() {
  const { isPremium } = usePremium();
  if (isPremium || !BannerAd || !BannerAdSize) return null;

  return (
    <View style={styles.wrap}>
      <BannerAd unitId={BANNER_UNIT_ID} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}

/**
 * Baner zakotwiczony na sztywno nad pływającym tab barem, wyśrodkowany.
 * Renderuje nic dla Premium / bez modułu / (efektywnie) gdy brak wypełnienia.
 */
export function AnchoredAdBanner() {
  const { isPremium } = usePremium();
  const insets = useSafeAreaInsets();
  if (isPremium || !BannerAd || !BannerAdSize) return null;

  return (
    <View
      style={[styles.anchor, { bottom: insets.bottom + ANCHOR_BOTTOM }]}
      pointerEvents="box-none"
    >
      <BannerAd unitId={BANNER_UNIT_ID} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  anchor: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 15 },
});

export default AdBanner;
