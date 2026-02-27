import { GoogleGenerativeAI } from '@google/generative-ai';
import Constants from 'expo-constants';
import { CATEGORIES, type Category } from '../../constants';
import type { AIParsedItem, AIParseResult, AIParseError } from '../../types/ai';

const VALID_CATEGORIES = CATEGORIES as readonly string[];
const MAX_INPUT_LENGTH = 500;

// Cached client instance
let cachedClient: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (cachedClient) return cachedClient;

  const apiKey = Constants.expoConfig?.extra?.geminiApiKey as string | undefined;
  if (!apiKey || !apiKey.trim()) {
    const error: AIParseError = {
      code: 'NETWORK_ERROR',
      message: 'Brak klucza API. Dodaj GEMINI_API_KEY w pliku .env.',
      rawInput: '',
    };
    throw error;
  }
  cachedClient = new GoogleGenerativeAI(apiKey);
  return cachedClient;
}

const SYSTEM_PROMPT = `Jesteś asystentem listy zakupów. Otrzymujesz tekst od użytkownika z produktami do kupienia.
Zwróć JSON array z obiektami, gdzie każdy obiekt to jeden produkt.

Każdy obiekt musi mieć:
- "name": string — nazwa produktu (po polsku, w mianowniku, bez ilości)
- "quantity": number — ilość (domyślnie 1)
- "unit": string | null — jednostka (np. "kg", "l", "szt", "opak") lub null
- "category": string — jedna z: ${CATEGORIES.join(', ')}

Zasady:
- Rozdzielaj produkty po przecinkach, "i", nowych liniach
- Jeśli użytkownik napisze "2 kg jabłek" → name: "Jabłka", quantity: 2, unit: "kg"
- Jeśli napisze "mleko" → name: "Mleko", quantity: 1, unit: null
- Używaj wielkich liter na początku nazwy
- Odpowiedz TYLKO poprawnym JSON array, bez markdown, bez komentarzy`;

function sanitizeInput(input: string): string {
  // Strip control characters, keep only printable text
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

function sanitizeItem(raw: Record<string, unknown>): AIParsedItem | null {
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (!name) return null;

  const quantity = typeof raw.quantity === 'number' && raw.quantity > 0 ? raw.quantity : 1;
  const unit = typeof raw.unit === 'string' && raw.unit.trim() ? raw.unit.trim() : undefined;

  const rawCategory = typeof raw.category === 'string' ? raw.category.trim() : 'Inne';
  const category = (VALID_CATEGORIES.includes(rawCategory) ? rawCategory : 'Inne') as Category;

  return {
    name: name.slice(0, 100),
    quantity,
    unit: unit?.slice(0, 20),
    category,
    confidence: VALID_CATEGORIES.includes(rawCategory) ? 0.9 : 0.5,
  };
}

export async function parseItemsWithAI(input: string): Promise<AIParseResult> {
  const sanitized = sanitizeInput(input);
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
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const result = await model.generateContent(
      SYSTEM_PROMPT + '\n\nProdukty od użytkownika:\n' + sanitized,
    );

    const response = result.response;
    const text = response.text().trim();

    // Strip markdown code fences if present
    const jsonText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      const error: AIParseError = {
        code: 'INVALID_RESPONSE',
        message: 'AI zwróciło nieprawidłową odpowiedź. Spróbuj ponownie.',
        rawInput: input,
      };
      throw error;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      const error: AIParseError = {
        code: 'PARSE_FAILED',
        message: 'Nie udało się rozpoznać produktów. Spróbuj inaczej.',
        rawInput: input,
      };
      throw error;
    }

    const items: AIParsedItem[] = parsed
      .map((raw) => sanitizeItem(raw as Record<string, unknown>))
      .filter((item): item is AIParsedItem => item !== null);

    if (items.length === 0) {
      const error: AIParseError = {
        code: 'PARSE_FAILED',
        message: 'Nie udało się rozpoznać produktów. Spróbuj inaczej.',
        rawInput: input,
      };
      throw error;
    }

    return {
      items,
      rawInput: input,
      language: 'pl',
    };
  } catch (err) {
    if ((err as AIParseError).code) {
      throw err;
    }

    const message = err instanceof Error ? err.message : 'Nieznany błąd';
    const error: AIParseError = {
      code: 'NETWORK_ERROR',
      message: `Błąd AI: ${message}`,
      rawInput: input,
    };
    throw error;
  }
}
