import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase/config';
import { COLLECTIONS } from '../../../constants';
import { AI_FREE_DAILY_LIMIT } from '../../../types/user';
import { useAuth } from '../../auth/hooks/useAuth';

export interface PremiumStatus {
  isPremium: boolean;
  aiUsageThisMonth: number;
  aiCallsRemaining: number;
  hasAIAccess: boolean;
  hoursUntilReset: number | null; // null = no limit (premium) or already reset
}

export function usePremium(): PremiumStatus {
  const { user } = useAuth();

  if (!user) {
    return { isPremium: false, aiUsageThisMonth: 0, aiCallsRemaining: 0, hasAIAccess: false, hoursUntilReset: null };
  }

  // Defensive client-side expiry check — Cloud Function scheduler is authoritative
  const rawExpiry = user.premiumExpiresAt as (Date & { toDate?: () => Date }) | undefined;
  const expiresAt: Date | null = rawExpiry
    ? (typeof rawExpiry.toDate === 'function' ? rawExpiry.toDate() : rawExpiry)
    : null;
  const isPremium = (user.isPremium ?? false) && (!expiresAt || expiresAt > new Date());

  if (isPremium) {
    return { isPremium: true, aiUsageThisMonth: 0, aiCallsRemaining: Infinity, hasAIAccess: true, hoursUntilReset: null };
  }

  const now = new Date();
  // Firestore returns Timestamps — handle both Timestamp (with .toDate()) and plain Date
  const raw = user.aiUsageResetDate as Date & { toDate?: () => Date };
  const resetDate: Date = typeof raw?.toDate === 'function' ? raw.toDate() : (raw instanceof Date ? raw : new Date(0));

  const isReset = now >= resetDate;
  const aiUsageThisMonth = user.aiUsageThisMonth ?? 0;
  const aiCallsRemaining = isReset ? AI_FREE_DAILY_LIMIT : Math.max(0, AI_FREE_DAILY_LIMIT - aiUsageThisMonth);
  const hasAIAccess = aiCallsRemaining > 0;

  const hoursUntilReset = !hasAIAccess
    ? Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60))
    : null;

  return { isPremium, aiUsageThisMonth, aiCallsRemaining, hasAIAccess, hoursUntilReset };
}

export async function grantPremium(userId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    isPremium: true,
  });
}
