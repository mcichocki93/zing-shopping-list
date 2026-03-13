import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';
import { sanitizeUserInput, MAX_INPUT_LENGTH } from '../../utils/sanitization';
import type { AIParsedItem, AIParseResult, AIParseError } from '../../types/ai';
import type { CustomCategory } from '../../types/user';

export async function parseItemsWithAI(input: string, customCategories: CustomCategory[] = []): Promise<AIParseResult> {
  const sanitized = sanitizeUserInput(input);
  if (!sanitized) {
    const error: AIParseError = {
      code: 'PARSE_FAILED',
      message: 'Podaj produkty do dodania.',
      rawInput: input,
    };
    throw error;
  }

  if (sanitized.length > MAX_INPUT_LENGTH) {
    const error: AIParseError = {
      code: 'PARSE_FAILED',
      message: `Tekst jest za długi (max ${MAX_INPUT_LENGTH} znaków).`,
      rawInput: input,
    };
    throw error;
  }

  try {
    // Call Cloud Function instead of direct Gemini API
    const parseFunction = httpsCallable<{ input: string; customCategories: CustomCategory[] }, { items: AIParsedItem[]; language: string }>(
      functions,
      'parseItemsWithAI'
    );

    const result = await parseFunction({ input: sanitized, customCategories });

    if (!result.data.items || result.data.items.length === 0) {
      const error: AIParseError = {
        code: 'PARSE_FAILED',
        message: 'Nie udało się rozpoznać produktów. Spróbuj inaczej.',
        rawInput: input,
      };
      throw error;
    }

    return {
      items: result.data.items,
      rawInput: input,
      language: result.data.language,
    };
  } catch (err: unknown) {
    // Check if it's already our error type
    if ((err as AIParseError).code) {
      throw err;
    }

    // Handle Firebase Functions errors
    if (err && typeof err === 'object' && 'code' in err) {
      const firebaseError = err as { code: string; message: string };

      // Map Firebase error codes to our error codes
      const errorMessages: Record<string, string> = {
        'unauthenticated': 'Musisz być zalogowany, aby użyć AI.',
        'resource-exhausted': 'Za dużo żądań. Spróbuj za godzinę.',
        'invalid-argument': 'Nieprawidłowe dane wejściowe.',
        'internal': firebaseError.message || 'Błąd AI. Spróbuj ponownie.',
      };

      const message = errorMessages[firebaseError.code] || firebaseError.message || 'Błąd połączenia z serwerem.';

      const error: AIParseError = {
        code: firebaseError.code === 'unauthenticated' ? 'NETWORK_ERROR' : 'PARSE_FAILED',
        message,
        rawInput: input,
      };
      throw error;
    }

    // Generic error fallback
    const message = err instanceof Error ? err.message : 'Nieznany błąd';
    const error: AIParseError = {
      code: 'NETWORK_ERROR',
      message: `Błąd AI: ${message}`,
      rawInput: input,
    };
    throw error;
  }
}
