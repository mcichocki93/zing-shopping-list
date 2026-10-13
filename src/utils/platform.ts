import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const isExpoGo = Constants.appOwnership === 'expo';

/**
 * Czy wolno użyć listy z przeciąganiem (react-native-draggable-flatlist).
 *
 * - Expo Go: moduł natywny Reanimated/gesture-handler nie jest zlinkowany.
 * - web: PanGestureHandler listy przechwytuje zdarzenia kółka myszy i całkowicie
 *   blokuje przewijanie — lista renderuje się, ale nie da się jej przesunąć.
 *
 * W oba przypadki renderujemy zwykły ScrollView: ta sama treść, bez zmiany
 * kolejności przeciąganiem.
 */
export const supportsDragList = !isExpoGo && Platform.OS !== 'web';
