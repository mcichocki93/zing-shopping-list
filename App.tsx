import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/features/auth/components';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { RootNavigator } from './src/navigation';
import { ErrorBoundary } from './src/components/ErrorBoundary';

export default function App() {
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
