// Fixed colors per known category — guarantees uniqueness and semantic sense
const CATEGORY_COLOR_MAP: Record<string, string> = {
  'Owoce i warzywa':     '#A5D6A7', // green
  'Nabiał':              '#90CAF9', // blue
  'Pieczywo':            '#FFCC80', // orange
  'Mięso i wędliny':     '#F48FB1', // pink
  'Ryby':                '#80DEEA', // cyan
  'Mrożonki':            '#B3E5FC', // light blue
  'Napoje':              '#CE93D8', // purple
  'Słodycze i przekąski':'#FFAB91', // salmon
  'Chemia domowa':       '#FFD54F', // amber
  'Higiena osobista':    '#E6EE9C', // lime
  'Inne':                '#B0BEC5', // grey
};

// Fallback palette for unknown / user-created categories
const FALLBACK_COLORS = [
  '#F48FB1', '#90CAF9', '#A5D6A7', '#FFCC80',
  '#CE93D8', '#80DEEA', '#FFAB91', '#FFD54F',
] as const;

export function getCategoryColor(category: string): string {
  if (CATEGORY_COLOR_MAP[category]) return CATEGORY_COLOR_MAP[category];
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}
