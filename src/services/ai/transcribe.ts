import { httpsCallable } from 'firebase/functions';
import i18n from '../../i18n';
import { functions } from '../firebase/config';
import type { AIParseError } from '../../types/ai';

type TranscribePayload = { audio: string; mimeType: string; language: string };
type TranscribeResponse = { transcript: string; language: string };

/**
 * Zamienia nagranie na tekst przez Cloud Function (Gemini).
 *
 * `audio` to base64 pliku WAV — konwersję robi wywołujący, bo przeglądarki
 * nagrywają w różnych kontenerach (Chrome webm/opus, Safari mp4/aac), a Gemini
 * przyjmuje tylko część z nich. WAV jest wspólnym mianownikiem.
 */
export async function transcribeAudio(audioBase64: string, mimeType = 'audio/wav'): Promise<string> {
  try {
    const call = httpsCallable<TranscribePayload, TranscribeResponse>(functions, 'transcribeAudio');
    const language = i18n.language === 'en' ? 'en' : 'pl';
    const result = await call({ audio: audioBase64, mimeType, language });
    return result.data.transcript ?? '';
  } catch (err: unknown) {
    // Mapujemy po KODZIE błędu, nie po treści — komunikaty z funkcji są po
    // polsku i nie powinny wyciekać do angielskiego interfejsu.
    if (err && typeof err === 'object' && 'code' in err) {
      const code = (err as { code: string }).code;
      const messages: Record<string, string> = {
        'unauthenticated': i18n.t('aiError.unauthenticated'),
        'resource-exhausted': i18n.t('aiError.tooManyRequests'),
        'permission-denied': i18n.t('errors.transcribePremium'),
        'invalid-argument': i18n.t('errors.transcribeFailed'),
        'internal': i18n.t('aiError.serverError'),
      };
      const error: AIParseError = {
        code: code === 'unauthenticated' ? 'NETWORK_ERROR' : 'PARSE_FAILED',
        message: messages[code] ?? i18n.t('aiError.serverConnection'),
        rawInput: '',
      };
      throw error;
    }
    const error: AIParseError = {
      code: 'NETWORK_ERROR',
      message: i18n.t('errors.transcribeFailed'),
      rawInput: '',
    };
    throw error;
  }
}
