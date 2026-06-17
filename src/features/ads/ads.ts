// Mobile Ads SDK init + UMP (GDPR) consent. Defensive native import — the module
// is unavailable in Expo Go / older dev builds, in which case ads are simply off.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mobileAds: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let AdsConsent: any = null;
try {
  const mod = require('react-native-google-mobile-ads');
  mobileAds = mod.default;
  AdsConsent = mod.AdsConsent;
} catch {
  /* native module not available */
}

let initialized = false;

/**
 * Gathers GDPR consent (shows the UMP form when required, e.g. in the EEA),
 * then initializes the Mobile Ads SDK. Safe to call once on app start; it is a
 * no-op if the native module is missing or already initialized.
 */
export async function initAds(): Promise<void> {
  if (!mobileAds || initialized) return;
  initialized = true;
  try {
    // 1. UMP consent — required before serving personalized ads in the EEA.
    if (AdsConsent) {
      await AdsConsent.requestInfoUpdate();
      await AdsConsent.loadAndShowConsentFormIfRequired();
    }
    // 2. Initialize the SDK (the form result is respected automatically).
    await mobileAds().initialize();
  } catch {
    // consent/init failed — ads just won't load, app keeps working
    initialized = false;
  }
}
