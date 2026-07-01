import { Platform } from 'react-native';

// AdMob ad unit IDs.
// In development we use Google's official TEST units (safe — never bill, never
// serve real ads). In production the real units MUST be provided below.
//
// Google test units: https://developers.google.com/admob/android/test-ads
const TEST_BANNER = 'ca-app-pub-3940256099942544/9214589741'; // adaptive banner (test)

// Prawdziwy banner unit z AdMob (serwowany tylko w buildzie produkcyjnym)
const PROD_BANNER_ANDROID = 'ca-app-pub-7437857814279855/5655522059';

// Prawdziwe reklamy TYLKO w buildzie produkcyjnym (profil production ustawia
// EXPO_PUBLIC_ADS_REAL=1). Wszędzie indziej (dev, preview/testy) — reklamy TESTOWE:
// zawsze się wyświetlają (potwierdzają działanie) i są bezpieczne do klikania.
const USE_REAL_ADS = process.env.EXPO_PUBLIC_ADS_REAL === '1';

export const BANNER_UNIT_ID = USE_REAL_ADS
  ? (Platform.select({ android: PROD_BANNER_ANDROID, default: TEST_BANNER }) ?? TEST_BANNER)
  : TEST_BANNER;
