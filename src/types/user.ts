export interface User {
  id: string;
  email: string;
  displayName: string;
  sharedListIds: string[];
  theme?: string;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}
