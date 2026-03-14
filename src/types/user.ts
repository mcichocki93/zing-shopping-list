export interface CustomCategory {
  name: string;
  color: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  sharedListIds: string[];
  theme?: string;
  createdAt: Date;
  lastActiveAt: Date;
  // Monetization
  isPremium: boolean;
  premiumExpiresAt?: Date;      // when the current subscription period ends
  subscriptionToken?: string;  // last known Google Play purchase token
  aiUsageThisMonth: number;
  aiUsageResetDate: Date;
  customCategories?: CustomCategory[];
  listOrder?: string[];
}

export const AI_FREE_DAILY_LIMIT = 1; // calls per 24h for free users

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}
