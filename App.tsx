import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import { AuthProvider } from './src/features/auth/components';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { RootNavigator } from './src/navigation';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { usePixelPopFonts } from './src/fonts';

let sentryInitError: string | null = null;
let SentryWrap: ((fn: () => React.ReactElement) => () => React.ReactElement) | null = null;

try {
  const Sentry = require('@sentry/react-native');
  Sentry.init({
    dsn: 'https://41b29658697bb4dcb421bf10599f7cfb@o4510665312108544.ingest.de.sentry.io/4511330230730832',
    tracesSampleRate: 0.2,
  });
  SentryWrap = Sentry.wrap;
} catch (e: any) {
  sentryInitError = e?.message ?? String(e);
}

function AppInner() {
  const fontsLoaded = usePixelPopFonts();

  useEffect(() => {
    try {
      const { recordEvent } = require('expo-insights');
      recordEvent('app_open');
    } catch {}
    // Gather GDPR consent + initialize ads (no-op for Premium-served screens;
    // banners themselves are hidden for Premium users in AdBanner).
    try {
      const { initAds } = require('./src/features/ads');
      initAds();
    } catch {}
  }, []);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <ThemeProvider>
              <RootNavigator />
              <StatusBar style="auto" />
            </ThemeProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

function App() {
  if (sentryInitError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' }}>
        <Text style={{ color: 'red', fontSize: 12, textAlign: 'center' }} selectable>
          Sentry init error: {sentryInitError}
        </Text>
        <AppInner />
      </View>
    );
  }
  return <AppInner />;
}

export default SentryWrap ? SentryWrap(App) : App;
