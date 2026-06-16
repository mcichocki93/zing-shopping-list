import { useAuth } from '../../auth/hooks/useAuth';

export interface PremiumStatus {
  isPremium: boolean;
  aiCallsRemaining: number;       // Infinity for premium, 0 for free
  hasAIAccess: boolean;           // AI is a Premium-only feature
  hoursUntilReset: number | null; // kept for API compatibility — always null now
}

export function usePremium(): PremiumStatus {
  const { user } = useAuth();

  if (!user) {
    return { isPremium: false, aiCallsRemaining: 0, hasAIAccess: false, hoursUntilReset: null };
  }

  // Defensive client-side expiry check — Cloud Function scheduler is authoritative
  const rawExpiry = user.premiumExpiresAt as (Date & { toDate?: () => Date }) | undefined;
  const expiresAt: Date | null = rawExpiry
    ? (typeof rawExpiry.toDate === 'function' ? rawExpiry.toDate() : rawExpiry)
    : null;
  const isPremium = (user.isPremium ?? false) && (!expiresAt || expiresAt > new Date());

  // AI access is binary: Premium = unlimited, Free = none.
  return isPremium
    ? { isPremium: true, aiCallsRemaining: Infinity, hasAIAccess: true, hoursUntilReset: null }
    : { isPremium: false, aiCallsRemaining: 0, hasAIAccess: false, hoursUntilReset: null };
}
