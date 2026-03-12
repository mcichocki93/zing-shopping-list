import { useState, useCallback, useEffect } from 'react';
import { Linking } from 'react-native';
import { isExpoGo } from '../../../utils/platform';

// expo-speech-recognition requires a native build — not available in Expo Go
const SpeechModule = !isExpoGo
  ? require('expo-speech-recognition')
  : null;

interface SpeechResultEvent {
  results: { transcript: string }[];
}

interface UseSpeechInputReturn {
  isListening: boolean;
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

  // Register event listeners via useEffect — satisfies rules of hooks (no conditional calls)
  useEffect(() => {
    if (!SpeechModule) return;
    const unsubStart = SpeechModule.useSpeechRecognitionEvent('start', () => setIsListening(true));
    const unsubEnd = SpeechModule.useSpeechRecognitionEvent('end', () => setIsListening(false));
    const unsubResult = SpeechModule.useSpeechRecognitionEvent('result', (event: SpeechResultEvent) => {
      const text: string = event.results[0]?.transcript ?? '';
      if (text) setTranscript(text);
    });
    const unsubError = SpeechModule.useSpeechRecognitionEvent('error', () => {
      setError('Nie udało się rozpoznać mowy. Spróbuj ponownie.');
      setIsListening(false);
    });
    return () => {
      unsubStart?.();
      unsubEnd?.();
      unsubResult?.();
      unsubError?.();
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
        setError('Brak dostępu do mikrofonu. Włącz w Ustawieniach telefonu → Aplikacje → Zing → Uprawnienia.');
        Linking.openSettings();
      } else {
        setError('Brak dostępu do mikrofonu.');
      }
      return;
    }
    SpeechModule.ExpoSpeechRecognitionModule.start({
      lang: 'pl-PL',
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
    transcript,
    error,
    isSupported: SpeechModule !== null,
    startListening,
    stopListening,
    clearTranscript,
  };
}
