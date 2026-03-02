/**
 * In-App Purchase service — skeleton for Google Play Billing.
 *
 * Full integration requires:
 *   1. Published app in Google Play Console
 *   2. Product created: "zing_premium" (one-time purchase)
 *   3. Install: npx expo install expo-iap
 *   4. Uncomment and implement the real purchase flow below
 *
 * For now this module exports types and stubs so the rest of the
 * app can be wired up without a live Play Store product.
 */

export const IAP_PRODUCT_ID = 'zing_premium';

export type PurchaseResult = 'success' | 'cancelled' | 'error';

/**
 * Stub — replace with real expo-iap call after publishing to Play Store.
 * Returns 'success' in development so the UI can be tested end-to-end.
 */
export async function purchasePremium(): Promise<PurchaseResult> {
  // TODO: Replace with expo-iap implementation
  // import * as IAP from 'expo-iap';
  // const products = await IAP.getProducts([IAP_PRODUCT_ID]);
  // const result = await IAP.requestPurchase(IAP_PRODUCT_ID);
  // verify receipt server-side via Cloud Function, then call grantPremium()

  if (__DEV__) {
    return 'success'; // simulate purchase in dev
  }

  return 'error';
}

/**
 * Stub — restore previous purchase on new device / reinstall.
 */
export async function restorePurchases(): Promise<boolean> {
  // TODO: implement with expo-iap
  return false;
}
