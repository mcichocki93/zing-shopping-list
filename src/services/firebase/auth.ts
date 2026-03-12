import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
  type User as FirebaseUser,
  type Unsubscribe,
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { auth, db, functions } from './config';
import { COLLECTIONS } from '../../constants';
import type { User } from '../../types/user';

async function fetchUserProfile(uid: string): Promise<User | null> {
  const snapshot = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as User;
}

async function createUserProfile(firebaseUser: FirebaseUser, displayName: string): Promise<User> {
  const now = new Date();
  const profile: Omit<User, 'id'> = {
    email: firebaseUser.email ?? '',
    displayName,
    sharedListIds: [],
    createdAt: now,
    lastActiveAt: now,
    isPremium: false,
    aiUsageThisMonth: 0,
    aiUsageResetDate: new Date(0), // epoch = immediately available
  };
  await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), {
    ...profile,
    createdAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
  });
  return { id: firebaseUser.uid, ...profile };
}

async function getOrCreateProfile(firebaseUser: FirebaseUser, fallbackName: string): Promise<User> {
  const profile = await fetchUserProfile(firebaseUser.uid);
  if (profile) return profile;
  return createUserProfile(firebaseUser, fallbackName || 'Użytkownik');
}

export async function signUp(
  email: string,
  password: string,
  displayName: string,
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  return createUserProfile(credential.user, displayName);
}

export async function signIn(
  email: string,
  password: string,
): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const profile = await fetchUserProfile(credential.user.uid);
  if (!profile) {
    return createUserProfile(credential.user, credential.user.displayName ?? '');
  }
  return profile;
}

export async function signInWithGoogle(): Promise<User> {
  const webClientId = Constants.expoConfig?.extra?.googleWebClientId as string | undefined;
  GoogleSignin.configure({ webClientId });
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) {
    throw new Error('Google sign-in cancelled');
  }
  const { idToken } = response.data;
  if (!idToken) throw new Error('Brak tokenu Google');
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  return getOrCreateProfile(result.user, result.user.displayName ?? '');
}

export async function signInWithApple(): Promise<User> {
  if (Platform.OS !== 'ios') throw new Error('Apple Sign-In dostępny tylko na iOS');
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });
  if (!credential.identityToken) throw new Error('Brak tokenu Apple');
  const provider = new OAuthProvider('apple.com');
  const oauthCredential = provider.credential({ idToken: credential.identityToken });
  const result = await signInWithCredential(auth, oauthCredential);
  const displayName = credential.fullName
    ? `${credential.fullName.givenName ?? ''} ${credential.fullName.familyName ?? ''}`.trim()
    : result.user.displayName ?? '';
  return getOrCreateProfile(result.user, displayName);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
  // Also sign out from Google if active
  try { await GoogleSignin.signOut(); } catch { /* not signed in via Google */ }
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function deleteAccount(): Promise<void> {
  const fn = httpsCallable(functions, 'deleteUserAccount');
  await fn({});
}

export function onAuthChanged(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }
    const profile = await fetchUserProfile(firebaseUser.uid);
    callback(profile);
  });
}
