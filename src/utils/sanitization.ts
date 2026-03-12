const MAX_INPUT_LENGTH = 500;

/**
 * Strips control characters and trims whitespace from user input.
 * The same logic is duplicated server-side in functions/index.js
 * as a security layer — both must remain in sync.
 */
export function sanitizeUserInput(input: string): string {
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

export { MAX_INPUT_LENGTH };
