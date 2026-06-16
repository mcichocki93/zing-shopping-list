import { Platform } from 'react-native';

// AdMob ad unit IDs.
// In development we use Google's official TEST units (safe — never bill, never
// serve real ads). In production the real units MUST be provided below.
//
// Google test units: https://developers.google.com/admob/android/test-ads
const TEST_BANNER = 'ca-app-pub-3940256099942544/9214589741'; // adaptive banner (test)

// TODO: ZAMIEŃ na prawdziwy banner unit z AdMob (Ad units → Banner) przed produkcją
const PROD_BANNER_ANDROID = 'ca-app-pub-0000000000000000/0000000000';

export const BANNER_UNIT_ID = __DEV__
  ? TEST_BANNER
  : Platform.select({ android: PROD_BANNER_ANDROID, default: TEST_BANNER }) ?? TEST_BANNER;
