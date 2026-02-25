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

export { COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE, FONT_WEIGHT, TEXT_STYLES } from './theme';
export { THEMES, THEME_NAMES, DEFAULT_THEME, type ThemeName, type AppTheme } from './themes';
export { CATEGORY_HEADER_COLORS, getCategoryColor } from './categoryColors';
