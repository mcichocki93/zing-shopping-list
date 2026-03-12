import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import type { User, AuthState } from '../../../types/user';
import { signUp, signIn, signInWithGoogle, signInWithApple, signOut, onAuthChanged, resetPassword, deleteAccount } from '../services';

interface AuthContextValue extends AuthState {
  handleSignUp: (email: string, password: string, displayName: string) => Promise<void>;
  handleSignIn: (email: string, password: string) => Promise<void>;
  handleSignInWithGoogle: () => Promise<void>;
  handleSignInWithApple: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  handleResetPassword: (email: string) => Promise<void>;
  handleDeleteAccount: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

export const AuthContext = createContext<AuthContextValue>({
  ...initialState,
  handleSignUp: async () => {},
  handleSignIn: async () => {},
  handleSignInWithGoogle: async () => {},
  handleSignInWithApple: async () => {},
  handleSignOut: async () => {},
  handleResetPassword: async () => {},
  handleDeleteAccount: async () => {},
});

export function useAuthProvider(): AuthContextValue {
  const [state, setState] = useState<AuthState>(initialState);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const unsubscribe = onAuthChanged((user: User | null) => {
      if (!mountedRef.current) return;
      setState({
        user,
        isLoading: false,
        isAuthenticated: !!user,
        error: null,
      });
    });

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, []);

  const handleSignUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const user = await signUp(email, password, displayName);
        if (!mountedRef.current) return;
        setState({ user, isLoading: false, isAuthenticated: true, error: null });
      } catch (err) {
        if (!mountedRef.current) return;
        setState((prev) => ({ ...prev, isLoading: false, error: getErrorMessage(err) }));
      }
    },
    [],
  );

  const handleSignIn = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const user = await signIn(email, password);
      if (!mountedRef.current) return;
      setState({ user, isLoading: false, isAuthenticated: true, error: null });
    } catch (err) {
      if (!mountedRef.current) return;
      setState((prev) => ({ ...prev, isLoading: false, error: getErrorMessage(err) }));
    }
  }, []);

  const handleSignInWithGoogle = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const user = await signInWithGoogle();
      if (!mountedRef.current) return;
      setState({ user, isLoading: false, isAuthenticated: true, error: null });
    } catch (err) {
      if (!mountedRef.current) return;
      const msg = getErrorMessage(err);
      // Silently ignore user-cancelled sign-in
      if (msg.includes('cancelled') || msg.includes('cancel')) {
        setState((prev) => ({ ...prev, isLoading: false }));
      } else {
        setState((prev) => ({ ...prev, isLoading: false, error: msg }));
      }
    }
  }, []);

  const handleSignInWithApple = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const user = await signInWithApple();
      if (!mountedRef.current) return;
      setState({ user, isLoading: false, isAuthenticated: true, error: null });
    } catch (err) {
      if (!mountedRef.current) return;
      const msg = getErrorMessage(err);
      if (msg.includes('cancelled') || msg.includes('cancel') || msg.includes('ERR_CANCELED')) {
        setState((prev) => ({ ...prev, isLoading: false }));
      } else {
        setState((prev) => ({ ...prev, isLoading: false, error: msg }));
      }
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await signOut();
      if (!mountedRef.current) return;
      setState({ user: null, isLoading: false, isAuthenticated: false, error: null });
    } catch (err) {
      if (!mountedRef.current) return;
      setState((prev) => ({ ...prev, isLoading: false, error: getErrorMessage(err) }));
    }
  }, []);

  const handleResetPassword = useCallback(async (email: string) => {
    try {
      await resetPassword(email);
      Alert.alert('Sukces', 'Link do resetowania hasła został wysłany na podany adres email.');
    } catch (err) {
      Alert.alert('Błąd', getErrorMessage(err));
    }
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await deleteAccount();
      // onAuthStateChanged fires after Firebase Auth user is deleted → sets state to null
    } catch (err) {
      if (!mountedRef.current) return;
      setState((prev) => ({ ...prev, isLoading: false, error: getErrorMessage(err) }));
    }
  }, []);

  return {
    ...state,
    handleSignUp,
    handleSignIn,
    handleSignInWithGoogle,
    handleSignInWithApple,
    handleSignOut,
    handleResetPassword,
    handleDeleteAccount,
  };
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const code = (err as { code?: string }).code;
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Ten email jest już zajęty.';
      case 'auth/invalid-email':
        return 'Nieprawidłowy adres email.';
      case 'auth/weak-password':
        return 'Hasło musi mieć min. 6 znaków.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Nieprawidłowy email lub hasło.';
      case 'auth/too-many-requests':
        return 'Za dużo prób. Spróbuj później.';
      default:
        return err.message;
    }
  }
  return 'Wystąpił nieoczekiwany błąd.';
}
