export const CATEGORY_HEADER_COLORS = [
  '#F48FB1',
  '#90CAF9',
  '#A5D6A7',
  '#FFCC80',
  '#CE93D8',
  '#FFF59D',
  '#80DEEA',
  '#FFAB91',
] as const;

export function getCategoryColor(category: string): string {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CATEGORY_HEADER_COLORS[Math.abs(hash) % CATEGORY_HEADER_COLORS.length];
}
