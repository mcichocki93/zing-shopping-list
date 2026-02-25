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

export function getCategoryColor(index: number): string {
  return CATEGORY_HEADER_COLORS[index % CATEGORY_HEADER_COLORS.length];
}
