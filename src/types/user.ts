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
  aiUsageThisMonth: number;
  aiUsageResetDate: Date;
}

export const AI_FREE_DAILY_LIMIT = 10; // calls per 24h for free users (TESTING: change back to 1 before release)

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}
