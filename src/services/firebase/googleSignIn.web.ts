// googleSignIn.web.ts — logowanie Google w przeglądarce.
//
// @react-native-google-signin to moduł natywny i w przeglądarce nie istnieje,
// więc przycisk Google nie działał na webie w ogóle. Tutaj robi to SDK Firebase
// przez okno popup — ta sama tożsamość, ten sam użytkownik w Firebase Auth,
// więc konto założone na Androidzie i na webie to jedno konto.
//
// WYMAGA: domena musi być dodana w Firebase Console → Authentication →
// Settings → Authorized domains. Bez tego popup zamyka się z auth/unauthorized-
// domain, nawet gdy wszystko inne jest poprawne.

import { GoogleAuthProvider, signInWithPopup, type User as FirebaseUser } from 'firebase/auth';
import i18n from '../../i18n';
import { auth } from './config';

export async function googleSignIn(): Promise<FirebaseUser> {
  const provider = new GoogleAuthProvider();
  // Bez tego przeglądarka z jedną sesją Google loguje od razu, co myli przy
  // kilku kontach — a listy zakupów bywają współdzielone rodzinnie.
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code ?? '';

    // useAuth wycisza błędy zawierające "cancel" — zamknięcie popupu przez
    // użytkownika nie jest awarią i nie powinno wyświetlać komunikatu.
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      throw new Error('Google sign-in cancelled');
    }
    if (code === 'auth/popup-blocked') {
      throw new Error(i18n.t('errors.googlePopupBlocked'));
    }
    if (code === 'auth/unauthorized-domain') {
      throw new Error(i18n.t('errors.googleUnauthorizedDomain'));
    }
    throw err;
  }
}

/**
 * Na webie nie ma osobnej sesji Google do posprzątania — signInWithPopup nie
 * zostawia nic poza sesją Firebase, którą firebaseSignOut i tak kończy.
 */
export async function googleSignOut(): Promise<void> {
  /* no-op */
}
