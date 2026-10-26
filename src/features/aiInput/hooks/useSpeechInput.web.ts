// useSpeechInput.web.ts — dyktowanie w przeglądarce.
//
// Metro wybiera ten plik zamiast useSpeechInput.ts na platformie web.
//
// DLACZEGO NIE WEB SPEECH API JAKO GŁÓWNA ŚCIEŻKA:
//   - Firefox nie implementuje SpeechRecognition w ogóle
//   - Safari na iOS ma je, ale zawodne i urywające się po pauzie
//   - Chrome i tak wysyła dźwięk na serwery Google
//   - `continuous: false` (domyślne) kończy nasłuch po pierwszej pauzie w mowie
//
// Zamiast tego nagrywamy przez MediaRecorder i wysyłamy do Gemini. Daje to
// jedną, przewidywalną jakość w każdej przeglądarce — w tym na iOS, który był
// całym powodem wersji PWA. Kosztem jest brak wyników pośrednich w trakcie
// mówienia i opóźnienie na wysłanie nagrania.
//
// Wywołanie Gemini kosztuje, więc ścieżka nagraniowa jest dla Premium.
// Darmowi użytkownicy dostają Web Speech API tam, gdzie w ogóle istnieje.

import { useState, useCallback, useRef, useEffect } from 'react';
import i18n from '../../../i18n';
import { usePremium } from '../../premium/hooks/usePremium';
import { transcribeAudio } from '../../../services/ai';

const MAX_RECORDING_MS = 60_000;
const TARGET_SAMPLE_RATE = 16_000;

// Minimalne typy Web Speech API. Biblioteka DOM w tej konfiguracji TS ich nie
// zawiera, a @types/dom-speech-recognition byłoby zależnością dla jednego pliku.
// Deklarujemy tylko to, czego faktycznie używamy.
interface WebSpeechAlternative {
  transcript: string;
}
interface WebSpeechResult {
  readonly length: number;
  [index: number]: WebSpeechAlternative;
}
interface WebSpeechResultList {
  readonly length: number;
  [index: number]: WebSpeechResult;
}
interface WebSpeechResultEvent {
  results: WebSpeechResultList;
}
interface WebSpeechErrorEvent {
  error: string;
}
interface WebSpeechRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: WebSpeechResultEvent) => void) | null;
  onerror: ((event: WebSpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface UseSpeechInputReturn {
  isListening: boolean;
  isTranscribing: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  clearTranscript: () => void;
}

// ─── WAV ─────────────────────────────────────────────────────────────────────

/** Surowy PCM 16-bit + 44-bajtowy nagłówek RIFF. */
function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeAscii = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };

  writeAscii(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeAscii(8, 'WAVE');
  writeAscii(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeAscii(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }
  return buffer;
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  // Porcjami, bo String.fromCharCode na całej tablicy przepełnia stos przy
  // dłuższych nagraniach.
  const CHUNK = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

/** Nagranie (dowolny kontener) → mono 16 kHz WAV w base64. */
async function blobToWavBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioCtx: typeof AudioContext =
    window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

  const ctx = new AudioCtx();
  let decoded: AudioBuffer;
  try {
    decoded = await ctx.decodeAudioData(arrayBuffer);
  } finally {
    void ctx.close();
  }

  let mono: Float32Array;
  let rate: number;
  try {
    const frames = Math.ceil(decoded.duration * TARGET_SAMPLE_RATE);
    const offline = new OfflineAudioContext(1, frames, TARGET_SAMPLE_RATE);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
    const rendered = await offline.startRendering();
    mono = rendered.getChannelData(0);
    rate = TARGET_SAMPLE_RATE;
  } catch {
    // Część przeglądarek (historycznie Safari) odmawia OfflineAudioContext przy
    // 16 kHz. Bierzemy wtedy pierwszy kanał w oryginalnej częstotliwości —
    // payload rośnie, ale transkrypcja działa.
    mono = decoded.getChannelData(0);
    rate = decoded.sampleRate;
  }

  return toBase64(encodeWav(mono, rate));
}

// ─── Wykrywanie możliwości ───────────────────────────────────────────────────

function canRecord(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.MediaRecorder !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia
  );
}

function speechApiClass(): (new () => WebSpeechRecognition) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => WebSpeechRecognition;
    webkitSpeechRecognition?: new () => WebSpeechRecognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Kody błędu Web Speech API → komunikat dla użytkownika. */
function speechErrorMessage(code: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return i18n.t('errors.micPermission');
    case 'audio-capture':
      return i18n.t('errors.micMissing');
    case 'no-speech':
      return i18n.t('errors.noSpeech');
    case 'network':
      return i18n.t('errors.speechNetwork');
    default:
      return i18n.t('errors.speechFailed');
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSpeechInput(): UseSpeechInputReturn {
  const { isPremium } = usePremium();
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionRef = useRef<WebSpeechRecognition | null>(null);
  const mountedRef = useRef(true);

  // Ścieżka nagraniowa tylko dla Premium — wywołanie Gemini kosztuje.
  const useRecording = isPremium && canRecord();
  const isSupported = useRecording || speechApiClass() !== null;

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      try {
        recorderRef.current?.state === 'recording' && recorderRef.current.stop();
      } catch { /* już zatrzymany */ }
      try {
        recognitionRef.current?.abort();
      } catch { /* nie wystartowało */ }
      releaseStream();
    };
  }, [releaseStream]);

  // ── nagrywanie + Gemini ──

  const startRecording = useCallback(async () => {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      // Przeglądarka nie odróżnia tu wyraźnie odmowy od braku mikrofonu,
      // a odmowa jest nieporównanie częstsza.
      setError(i18n.t('errors.micPermission'));
      return;
    }
    streamRef.current = stream;
    chunksRef.current = [];

    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.onerror = () => {
      if (!mountedRef.current) return;
      setError(i18n.t('errors.speechFailed'));
      setIsListening(false);
      releaseStream();
    };

    recorder.onstop = async () => {
      releaseStream();
      // Zużyty MediaRecorder nie jest już do niczego potrzebny, a zostawianie
      // go w referencji myli kontrolę stanu przy następnym nagraniu.
      if (recorderRef.current === recorder) recorderRef.current = null;
      if (!mountedRef.current) return;
      setIsListening(false);

      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
      chunksRef.current = [];
      if (blob.size === 0) {
        setError(i18n.t('errors.noSpeech'));
        return;
      }

      setIsTranscribing(true);
      try {
        const base64 = await blobToWavBase64(blob);
        const text = await transcribeAudio(base64, 'audio/wav');
        if (!mountedRef.current) return;
        if (text) setTranscript(text);
        else setError(i18n.t('errors.noSpeech'));
      } catch (err) {
        if (!mountedRef.current) return;
        const message = (err as { message?: string })?.message;
        setError(message ?? i18n.t('errors.transcribeFailed'));
      } finally {
        if (mountedRef.current) setIsTranscribing(false);
      }
    };

    recorder.start();
    setIsListening(true);

    // Zabezpieczenie na wypadek, gdyby użytkownik nie zatrzymał nagrania —
    // chroni i limit payloadu callable, i rachunek za Gemini.
    timeoutRef.current = setTimeout(() => {
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    }, MAX_RECORDING_MS);
  }, [releaseStream]);

  // ── Web Speech API (darmowi użytkownicy) ──

  const startSpeechApi = useCallback(() => {
    const Recognition = speechApiClass();
    if (!Recognition) {
      setError(i18n.t('errors.recordingUnsupported'));
      return;
    }

    // Chrome potrafi wystartować nową instancję, ale nie przekazać jej dźwięku,
    // jeśli poprzednia nie została jawnie porzucona. Objawia się tak, że
    // dyktowanie działa raz, a każda kolejna próba "nie słyszy" — bez błędu.
    // Samo nadpisanie referencji nie wystarcza, trzeba abort() i odpięcie
    // handlerów.
    const previous = recognitionRef.current;
    if (previous) {
      previous.onresult = null;
      previous.onerror = null;
      previous.onend = null;
      try {
        previous.abort();
      } catch { /* już zakończona */ }
      recognitionRef.current = null;
    }

    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = i18n.language === 'en' ? 'en-US' : 'pl-PL';
    recognition.interimResults = true;
    // Bez tego API kończy nasłuch po pierwszej pauzie w mowie i druga połowa
    // listy przepada.
    recognition.continuous = true;

    recognition.onresult = (event: WebSpeechResultEvent) => {
      if (!mountedRef.current) return;
      let text = '';
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0]?.transcript ?? '';
      }
      if (text) setTranscript(text);
    };
    recognition.onerror = (event: WebSpeechErrorEvent) => {
      if (!mountedRef.current) return;
      setError(speechErrorMessage(event.error));
      setIsListening(false);
    };
    recognition.onend = () => {
      // Zwalniamy referencję, żeby następny start nie musiał sprzątać po
      // zakończonej sesji — i żeby nie porzucać instancji, która już nie żyje.
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      if (mountedRef.current) setIsListening(false);
    };

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      // Powtórne start() rzuca InvalidStateError — traktujemy jak brak reakcji.
      setError(i18n.t('errors.speechFailed'));
    }
  }, []);

  // ── API hooka ──

  const startListening = useCallback(async () => {
    if (isListening || isTranscribing) return;
    setError(null);
    setTranscript('');
    if (useRecording) await startRecording();
    else startSpeechApi();
  }, [isListening, isTranscribing, useRecording, startRecording, startSpeechApi]);

  const stopListening = useCallback(() => {
    if (useRecording) {
      try {
        if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      } catch { /* już zatrzymany */ }
      return;
    }
    try {
      recognitionRef.current?.stop();
    } catch { /* nie wystartowało */ }
  }, [useRecording]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    isTranscribing,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
  };
}
