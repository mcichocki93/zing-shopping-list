import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
  type Unsubscribe,
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, functions } from './config';
import { COLLECTIONS } from '../../constants';
import type { User, CustomCategory } from '../../types/user';

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

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function saveCustomCategories(uid: string, categories: CustomCategory[]): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), { customCategories: categories });
}

export async function saveListOrder(uid: string, listOrder: string[]): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), { listOrder });
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
