import { httpsCallable } from 'firebase/functions';
import i18n from '../../i18n';
import { functions } from '../firebase/config';
import { sanitizeUserInput, MAX_INPUT_LENGTH } from '../../utils/sanitization';
import type { AIParsedItem, AIParseResult, AIParseError } from '../../types/ai';
import type { CustomCategory } from '../../types/user';

type ParsePayload = { input: string; customCategories: CustomCategory[]; language: string };
type ParseResponse = { items: AIParsedItem[]; language: string };

export async function parseItemsWithAI(input: string, customCategories: CustomCategory[] = []): Promise<AIParseResult> {
  const sanitized = sanitizeUserInput(input);
  if (!sanitized) {
    const error: AIParseError = {
      code: 'PARSE_FAILED',
      message: i18n.t('aiError.emptyInput'),
      rawInput: input,
    };
    throw error;
  }

  if (sanitized.length > MAX_INPUT_LENGTH) {
    const error: AIParseError = {
      code: 'PARSE_FAILED',
      message: i18n.t('aiError.tooLong', { max: MAX_INPUT_LENGTH }),
      rawInput: input,
    };
    throw error;
  }

  try {
    // Call Cloud Function instead of direct Gemini API
    const parseFunction = httpsCallable<ParsePayload, ParseResponse>(
      functions,
      'parseItemsWithAI'
    );

    // Backward compatible: the deployed function defaults to Polish when this
    // is absent, so old builds keep working unchanged.
    const language = i18n.language === 'en' ? 'en' : 'pl';
    const result = await parseFunction({ input: sanitized, customCategories, language });

    if (!result.data.items || result.data.items.length === 0) {
      const error: AIParseError = {
        code: 'PARSE_FAILED',
        message: i18n.t('aiError.parseFailed'),
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

      // Map Firebase error codes to localized messages
      const errorMessages: Record<string, string> = {
        'unauthenticated': i18n.t('aiError.unauthenticated'),
        'resource-exhausted': i18n.t('aiError.tooManyRequests'),
        'invalid-argument': i18n.t('aiError.invalidInput'),
        'internal': i18n.t('aiError.serverError'),
      };

      const message = errorMessages[firebaseError.code] || firebaseError.message || i18n.t('aiError.serverConnection');

      const error: AIParseError = {
        code: firebaseError.code === 'unauthenticated' ? 'NETWORK_ERROR' : 'PARSE_FAILED',
        message,
        rawInput: input,
      };
      throw error;
    }

    // Generic error fallback
    const message = err instanceof Error ? err.message : i18n.t('aiError.unknown');
    const error: AIParseError = {
      code: 'NETWORK_ERROR',
      message: i18n.t('aiError.generic', { message }),
      rawInput: input,
    };
    throw error;
  }
}
