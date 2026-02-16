import { useState, useCallback, useRef, useEffect } from 'react';
import { parseItemsWithAI } from '../../../services/ai';
import type { AIParsedItem, AIParseError } from '../../../types/ai';

interface UseAIParserReturn {
  parsedItems: AIParsedItem[];
  isParsing: boolean;
  error: string | null;
  canRetry: boolean;
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
  const lastInputRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const parse = useCallback(async (input: string) => {
    lastInputRef.current = input;
    setError(null);
    setIsParsing(true);
    setParsedItems([]);

    try {
      const result = await parseItemsWithAI(input);
      if (!mountedRef.current) return;
      setParsedItems(result.items);
    } catch (err) {
      if (!mountedRef.current) return;
      const aiError = err as AIParseError;
      setError(aiError.message || 'Nieznany błąd.');
    } finally {
      if (mountedRef.current) {
        setIsParsing(false);
      }
    }
  }, []);

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
    lastInputRef.current = null;
  }, []);

  return {
    parsedItems,
    isParsing,
    error,
    canRetry: error !== null && lastInputRef.current !== null,
    parse,
    retry,
    updateItem,
    removeItem,
    clear,
  };
}
