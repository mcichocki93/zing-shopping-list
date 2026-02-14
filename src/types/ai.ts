import type { Category } from '../constants';

export interface AIParsedItem {
  name: string;
  quantity: number;
  unit?: string;
  category?: Category;
  confidence: number;
}

export interface AIParseResult {
  items: AIParsedItem[];
  rawInput: string;
  language: string;
}

export interface AIParseError {
  code: 'PARSE_FAILED' | 'NETWORK_ERROR' | 'INVALID_RESPONSE';
  message: string;
  rawInput: string;
}
