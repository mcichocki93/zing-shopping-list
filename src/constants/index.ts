export const COLLECTIONS = {
  USERS: 'users',
  SHOPPING_LISTS: 'shoppingLists',
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

export { COLORS, SPACING, BORDERS, TOUCH } from './theme';
