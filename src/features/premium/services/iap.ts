import {
  initConnection,
  endConnection,
  requestPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  getAvailablePurchases,
  type Purchase,
} from 'expo-iap';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../services/firebase/config';
import Constants from 'expo-constants';

export const IAP_PRODUCT_ID = 'zing_premium_monthly';

export type PurchaseResult = 'success' | 'cancelled' | 'error';

let connectionActive = false;

export async function initIAP(): Promise<void> {
  if (connectionActive) return;
  try {
    await initConnection();
    connectionActive = true;
  } catch {
    // Play Billing not available (emulator, unsupported device)
  }
}

export async function endIAP(): Promise<void> {
  if (!connectionActive) return;
  try {
    await endConnection();
    connectionActive = false;
  } catch {
    // ignore
  }
}

type VerifyPayload = { purchaseToken: string; packageName: string } | { devGrant: boolean };
type VerifyResult = { success: boolean };

async function verifyWithServer(purchaseToken: string): Promise<void> {
  const packageName = Constants.expoConfig?.android?.package ?? '';
  const fn = httpsCallable<VerifyPayload, VerifyResult>(functions, 'verifyAndGrantPremium');
  const result = await fn({ purchaseToken, packageName });
  if (!result.data.success) {
    throw new Error('Weryfikacja zakupu nieudana.');
  }
}

export async function purchasePremium(): Promise<PurchaseResult> {
  if (__DEV__) {
    // In dev, call server with devGrant flag — only works against the local emulator
    try {
      const fn = httpsCallable<VerifyPayload, VerifyResult>(functions, 'verifyAndGrantPremium');
      await fn({ devGrant: true });
    } catch {
      // dev grant not available — ignore for UI testing
    }
    return 'success';
  }

  return new Promise<PurchaseResult>((resolve) => {
    const updateSub = purchaseUpdatedListener(async (purchase: Purchase) => {
      if (purchase.productId !== IAP_PRODUCT_ID) return;
      try {
        const token = (purchase as { purchaseToken?: string | null }).purchaseToken ?? '';
        if (!token) throw new Error('Brak tokenu zakupu.');
        await verifyWithServer(token);
        await finishTransaction({ purchase });
        cleanup();
        resolve('success');
      } catch {
        cleanup();
        resolve('error');
      }
    });

    const errorSub = purchaseErrorListener((error) => {
      cleanup();
      const msg = String((error as { message?: unknown }).message ?? '');
      if (msg.includes('cancel') || msg.includes('E_USER_CANCELLED')) {
        resolve('cancelled');
      } else {
        resolve('error');
      }
    });

    function cleanup() {
      updateSub.remove();
      errorSub.remove();
    }

    requestPurchase({
      request: { google: { skus: [IAP_PRODUCT_ID] } },
      type: 'subs',
    }).catch(() => {
      cleanup();
      resolve('error');
    });
  });
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const purchases = await getAvailablePurchases();
    const premium = purchases.find((p) => p.productId === IAP_PRODUCT_ID);
    if (!premium) return false;
    const token = (premium as { purchaseToken?: string | null }).purchaseToken ?? '';
    if (!token) return false;
    await verifyWithServer(token);
    return true;
  } catch {
    return false;
  }
}
