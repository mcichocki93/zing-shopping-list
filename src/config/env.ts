import Constants from 'expo-constants';
import type { FirebaseConfig } from '../types/firebase';

function getEnvVar(key: string): string {
  const value = Constants.expoConfig?.extra?.[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value as string;
}

export const firebaseConfig: FirebaseConfig = {
  apiKey: getEnvVar('firebaseApiKey'),
  authDomain: getEnvVar('firebaseAuthDomain'),
  projectId: getEnvVar('firebaseProjectId'),
  storageBucket: getEnvVar('firebaseStorageBucket'),
  messagingSenderId: getEnvVar('firebaseMessagingSenderId'),
  appId: getEnvVar('firebaseAppId'),
  measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId as string | undefined,
};
