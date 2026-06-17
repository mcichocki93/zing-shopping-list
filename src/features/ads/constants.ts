import { Platform } from 'react-native';

// AdMob ad unit IDs.
// In development we use Google's official TEST units (safe — never bill, never
// serve real ads). In production the real units MUST be provided below.
//
// Google test units: https://developers.google.com/admob/android/test-ads
const TEST_BANNER = 'ca-app-pub-3940256099942544/9214589741'; // adaptive banner (test)

// Prawdziwy banner unit z AdMob (serwowany tylko w buildzie produkcyjnym)
const PROD_BANNER_ANDROID = 'ca-app-pub-7437857814279855/5655522059';

export const BANNER_UNIT_ID = __DEV__
  ? TEST_BANNER
  : Platform.select({ android: PROD_BANNER_ANDROID, default: TEST_BANNER }) ?? TEST_BANNER;
