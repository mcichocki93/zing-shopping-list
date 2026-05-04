import * as Sentry from '@sentry/react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/features/auth/components';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { RootNavigator } from './src/navigation';
import { ErrorBoundary } from './src/components/ErrorBoundary';

Sentry.init({
  dsn: 'https://41b29658697bb4dcb421bf10599f7cfb@o4510665312108544.ingest.de.sentry.io/4511330230730832',
  tracesSampleRate: 0.2,
  _experiments: { profilesSampleRate: 0.2 },
});

export default Sentry.wrap(function App() {
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
});
