export const COLLECTIONS = {
  USERS: 'users',
  SHOPPING_LISTS: 'shoppingLists',
  INVITES: 'invites',
} as const;

export const CATEGORIES = [
  'Owoce i warzywa',
  'Nabiał',
  'Mięso i ryby',
  'Pieczywo',
  'Napoje',
  'Przekąski',
  'Mrożonki',
  'Chemia',
  'Inne',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const UNITS = ['szt', 'kg', 'g', 'dag', 'l', 'ml', 'm', 'cm', 'opak'] as const;
export type Unit = (typeof UNITS)[number];

// Units where decimal quantities make sense (step 0.5, min 0.1)
export const DECIMAL_UNITS = new Set<string>(['kg', 'g', 'dag', 'l', 'ml', 'm', 'cm']);

export { COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE, FONT_WEIGHT, TEXT_STYLES } from './theme';
export { THEMES, THEME_NAMES, DEFAULT_THEME, type ThemeName, type AppTheme } from './themes';
export { getCategoryColor } from './categoryColors';
