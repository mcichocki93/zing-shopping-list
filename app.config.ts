import 'dotenv/config';
import type { ExpoConfig, ConfigContext } from 'expo/config';
import { withAndroidManifest } from 'expo/config-plugins';

// Directly inject RECORD_AUDIO permission — workaround for expo-speech-recognition
// plugin not applying it correctly with SDK 54
function withRecordAudio(config: ExpoConfig): ExpoConfig {
  return withAndroidManifest(config, (c) => {
    const manifest = c.modResults.manifest;
    const perms: Array<{ $: { 'android:name': string } }> = manifest['uses-permission'] ?? [];
    const hasIt = perms.some((p) => p.$['android:name'] === 'android.permission.RECORD_AUDIO');
    if (!hasIt) {
      perms.push({ $: { 'android:name': 'android.permission.RECORD_AUDIO' } });
    }
    manifest['uses-permission'] = perms;
    return c;
  });
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const base: ExpoConfig = {
    ...config,
    name: 'Zing',
    slug: 'zing',
    scheme: 'zing',
    android: {
      package: 'com.cichy093.zing',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      permissions: ['android.permission.RECORD_AUDIO'],
    },
    plugins: [
      'expo-font',
      ['expo-speech-recognition', {
        microphonePermission: 'Zing potrzebuje dostępu do mikrofonu, aby rozpoznawać produkty głosem.',
        speechRecognitionPermission: 'Zing potrzebuje dostępu do rozpoznawania mowy.',
      }],
    ],
    extra: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID,
      eas: {
        projectId: '8bfa11a0-18f2-48a7-ba45-87ba46584410',
      },
    },
  };
  return withRecordAudio(base);
};
