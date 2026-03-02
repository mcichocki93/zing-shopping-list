import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase/config';
import { COLLECTIONS } from '../../../constants';
import { AI_FREE_LIMIT } from '../../../types/user';
import { useAuth } from '../../auth/hooks/useAuth';

export interface PremiumStatus {
  isPremium: boolean;
  aiUsageThisMonth: number;
  aiCallsRemaining: number;
  hasAIAccess: boolean;
}

export function usePremium(): PremiumStatus {
  const { user } = useAuth();

  if (!user) {
    return { isPremium: false, aiUsageThisMonth: 0, aiCallsRemaining: 0, hasAIAccess: false };
  }

  const isPremium = user.isPremium ?? false;
  const aiUsageThisMonth = user.aiUsageThisMonth ?? 0;
  const aiCallsRemaining = isPremium ? Infinity : Math.max(0, AI_FREE_LIMIT - aiUsageThisMonth);
  const hasAIAccess = isPremium || aiCallsRemaining > 0;

  return { isPremium, aiUsageThisMonth, aiCallsRemaining, hasAIAccess };
}

export async function grantPremium(userId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    isPremium: true,
  });
}
