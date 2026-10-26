import { useState, useCallback, useEffect } from 'react';
import { Linking } from 'react-native';
import i18n from '../../../i18n';
import { isExpoGo } from '../../../utils/platform';

// expo-speech-recognition requires a native build — not available in Expo Go
let SpeechModule: typeof import('expo-speech-recognition') | null = null;
try {
  if (!isExpoGo) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    SpeechModule = require('expo-speech-recognition');
  }
} catch { /* not available in this build */ }

interface SpeechResultEvent {
  results: { transcript: string }[];
}

interface UseSpeechInputReturn {
  isListening: boolean;
  /**
   * Trwa zamiana nagrania na tekst. Na natywnych platformach zawsze false —
   * rozpoznawanie idzie strumieniowo na urządzeniu. Wariant webowy
   * (useSpeechInput.web.ts) nagrywa i wysyła nagranie, więc ma tu realny stan.
   */
  isTranscribing: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  clearTranscript: () => void;
}

export function useSpeechInput(): UseSpeechInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Use addListener directly on ExpoSpeechRecognitionModule (NOT useSpeechRecognitionEvent hook)
  // Calling a hook inside useEffect violates Rules of Hooks and crashes on Android
  useEffect(() => {
    if (!SpeechModule) return;
    const module = SpeechModule.ExpoSpeechRecognitionModule;

    const subStart = module.addListener('start', () => setIsListening(true));
    const subEnd = module.addListener('end', () => setIsListening(false));
    const subResult = module.addListener('result', (event: SpeechResultEvent) => {
      const text: string = event.results[0]?.transcript ?? '';
      if (text) setTranscript(text);
    });
    const subError = module.addListener('error', () => {
      setError(i18n.t('errors.speechFailed'));
      setIsListening(false);
    });

    return () => {
      subStart.remove();
      subEnd.remove();
      subResult.remove();
      subError.remove();
    };
  }, []);

  const startListening = useCallback(async () => {
    if (!SpeechModule) return;
    setError(null);
    setTranscript('');
    const { granted, canAskAgain } =
      await SpeechModule.ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      if (!canAskAgain) {
        setError(i18n.t('errors.micPermission'));
        Linking.openSettings();
      } else {
        setError(i18n.t('errors.micPermissionShort'));
      }
      return;
    }
    SpeechModule.ExpoSpeechRecognitionModule.start({
      lang: i18n.language === 'en' ? 'en-US' : 'pl-PL',
      interimResults: true,
    });
  }, []);

  const stopListening = useCallback(() => {
    SpeechModule?.ExpoSpeechRecognitionModule.stop();
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    isTranscribing: false,
    transcript,
    error,
    isSupported: SpeechModule !== null,
    startListening,
    stopListening,
    clearTranscript,
  };
}
