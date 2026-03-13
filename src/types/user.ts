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
  aiUsageThisMonth: number;
  aiUsageResetDate: Date;
  customCategories?: CustomCategory[];
}

export const AI_FREE_DAILY_LIMIT = 1; // calls per 24h for free users

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}
