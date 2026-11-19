// googleSignIn.ts — logowanie Google na platformach natywnych.
//
// Wariant webowy jest w googleSignIn.web.ts: @react-native-google-signin to
// moduł natywny, którego w przeglądarce nie ma, więc web używa signInWithPopup
// z SDK Firebase. Oba pliki zwracają to samo — zalogowanego FirebaseUser —
// żeby auth.ts nie musiał wiedzieć, na czym stoi.

import { GoogleAuthProvider, signInWithCredential, type User as FirebaseUser } from 'firebase/auth';
import Constants from 'expo-constants';
import i18n from '../../i18n';
import { auth } from './config';

// Defensywny import — moduł natywny bywa niezlinkowany w starszych buildach.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let GoogleSignin: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let isSuccessResponse: ((response: any) => boolean) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('@react-native-google-signin/google-signin');
  GoogleSignin = mod.GoogleSignin;
  isSuccessResponse = mod.isSuccessResponse;
} catch { /* moduł natywny niedostępny */ }

export async function googleSignIn(): Promise<FirebaseUser> {
  if (!GoogleSignin || !isSuccessResponse) {
    throw new Error(i18n.t('errors.googleUnavailable'));
  }

  const webClientId = Constants.expoConfig?.extra?.googleWebClientId as string | undefined;
  GoogleSignin.configure({ webClientId });
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) {
    // useAuth wycisza błędy zawierające "cancel" — użytkownik, który się
    // rozmyślił, nie powinien widzieć komunikatu o porażce.
    throw new Error('Google sign-in cancelled');
  }

  const { idToken } = response.data;
  if (!idToken) throw new Error('Brak tokenu Google');

  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  return result.user;
}

/** Wylogowanie z sesji Google. Firebase sign-out nie czyści jej samodzielnie. */
export async function googleSignOut(): Promise<void> {
  try {
    await GoogleSignin?.signOut();
  } catch { /* nie było sesji Google */ }
}
