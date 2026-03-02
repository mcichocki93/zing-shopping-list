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

export const AI_FREE_LIMIT = 10; // calls per month for free users

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}
