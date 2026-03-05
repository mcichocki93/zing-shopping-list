import { useState, useCallback, useRef, useEffect } from 'react';
import { parseItemsWithAI } from '../../../services/ai';
import { usePremium } from '../../premium/hooks/usePremium';
import type { AIParsedItem, AIParseError } from '../../../types/ai';

interface UseAIParserReturn {
  parsedItems: AIParsedItem[];
  isParsing: boolean;
  error: string | null;
  canRetry: boolean;
  limitReached: boolean;
  aiCallsRemaining: number;
  isPremium: boolean;
  parse: (input: string) => Promise<void>;
  retry: () => Promise<void>;
  updateItem: (index: number, updates: Partial<AIParsedItem>) => void;
  removeItem: (index: number) => void;
  clear: () => void;
}

export function useAIParser(): UseAIParserReturn {
  const [parsedItems, setParsedItems] = useState<AIParsedItem[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const lastInputRef = useRef<string | null>(null);
  const mountedRef = useRef(true);
  const { hasAIAccess, aiCallsRemaining, isPremium } = usePremium();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const parse = useCallback(async (input: string) => {
    if (!hasAIAccess) {
      setLimitReached(true);
      return;
    }

    lastInputRef.current = input;
    setError(null);
    setLimitReached(false);
    setIsParsing(true);
    setParsedItems([]);

    try {
      const result = await parseItemsWithAI(input);
      if (!mountedRef.current) return;
      setParsedItems(result.items);
    } catch (err) {
      if (!mountedRef.current) return;
      const aiError = err as AIParseError;
      // Cloud Function returns resource-exhausted when monthly limit hit
      if (aiError.message?.includes('limit') || aiError.message?.includes('miesiąc')) {
        setLimitReached(true);
      } else {
        setError(aiError.message || 'Nieznany błąd.');
      }
    } finally {
      if (mountedRef.current) {
        setIsParsing(false);
      }
    }
  }, [hasAIAccess]);

  const updateItem = useCallback((index: number, updates: Partial<AIParsedItem>) => {
    setParsedItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item)),
    );
  }, []);

  const removeItem = useCallback((index: number) => {
    setParsedItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const retry = useCallback(async () => {
    if (lastInputRef.current) {
      await parse(lastInputRef.current);
    }
  }, [parse]);

  const clear = useCallback(() => {
    setParsedItems([]);
    setError(null);
    setLimitReached(false);
    lastInputRef.current = null;
  }, []);

  return {
    parsedItems,
    isParsing,
    error,
    limitReached,
    aiCallsRemaining,
    isPremium,
    canRetry: error !== null && lastInputRef.current !== null,
    parse,
    retry,
    updateItem,
    removeItem,
    clear,
  };
}
