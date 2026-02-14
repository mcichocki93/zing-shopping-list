import { Platform } from 'react-native';
import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from '../../config/env';
import type { FirebaseServices } from '../../types/firebase';

function initializeFirebase(): FirebaseServices {
  const isFirstInit = getApps().length === 0;
  const app = isFirstInit ? initializeApp(firebaseConfig) : getApp();

  let auth;
  if (isFirstInit) {
    if (Platform.OS === 'web') {
      auth = initializeAuth(app, {
        persistence: browserLocalPersistence,
      });
    } else {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
      });
    }
  } else {
    auth = getAuth(app);
  }

  const db = getFirestore(app);

  return { app, auth, db };
}

const firebase = initializeFirebase();

export const { app, auth, db } = firebase;
export default firebase;
