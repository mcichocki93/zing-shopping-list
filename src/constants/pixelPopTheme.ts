// pixelPopTheme.ts — tokeny designu „Pixel Pop" dla Zing.
// Skopiuj do: src/constants/pixelPopTheme.ts

import { TextStyle } from 'react-native';

export const PP = {
  ink:    '#120E22', // bordery, tekst, twardy cień
  paper:  '#FFF8EE', // tło ekranu
  panel:  '#FFFFFF', // karty
  muted:  '#6B6580', // tekst drugorzędny
  pink:   '#FF3B8F', // domyślny akcent
  yellow: '#FFD12E',
  violet: '#6B4BFF',
  cyan:   '#3BE3FF',
} as const;

// Tło kafelków/nagłówków kategorii. Tekst/ikona na nich = PP.ink.
export const PP_CAT: Record<string, string> = {
  'Owoce i warzywa': '#7EE29A',
  'Nabiał':          '#3BE3FF',
  'Pieczywo':        '#FFD12E',
  'Mięso i ryby':    '#FF9CCB',
  'Napoje':          '#C7A8FF',
};

const FALLBACK_CAT = ['#7EE29A', '#3BE3FF', '#FFD12E', '#FF9CCB', '#C7A8FF', '#FFB37A'];

export function ppCategoryColor(category: string): string {
  if (PP_CAT[category]) return PP_CAT[category];
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = category.charCodeAt(i) + ((hash << 5) - hash);
  return FALLBACK_CAT[Math.abs(hash) % FALLBACK_CAT.length];
}

// Nazwy rodzin fontów — muszą zgadzać się z tym, co ładujesz w fonts.ts
export const PP_FONT = {
  display: 'Silkscreen_400Regular',
  displayBold: 'Silkscreen_700Bold',
  ui: 'Inter_400Regular',
  uiMed: 'Inter_500Medium',
  uiSemi: 'Inter_600SemiBold',
  uiBold: 'Inter_700Bold',
  uiBlack: 'Inter_800ExtraBold',
} as const;

export const PP_BORDER = { thin: 2, base: 2.5, thick: 3 } as const;
export const PP_RADIUS = 0; // OSTRE narożniki — esencja stylu

// Gotowe style tekstu
export const ppText = {
  brand:    { fontFamily: PP_FONT.display, fontSize: 15, color: PP.ink } as TextStyle,
  title:    { fontFamily: PP_FONT.uiBlack, fontSize: 27, letterSpacing: -0.5, color: PP.ink } as TextStyle,
  heroNum:  { fontFamily: PP_FONT.display, fontSize: 42, color: PP.ink } as TextStyle,
  catLabel: { fontFamily: PP_FONT.display, fontSize: 12, color: PP.ink } as TextStyle,
  rowTitle: { fontFamily: PP_FONT.uiBlack, fontSize: 15, color: PP.ink } as TextStyle,
  rowBody:  { fontFamily: PP_FONT.uiSemi, fontSize: 14, color: PP.ink } as TextStyle,
  meta:     { fontFamily: PP_FONT.uiSemi, fontSize: 10, color: PP.muted } as TextStyle,
  tab:      { fontFamily: PP_FONT.uiSemi, fontSize: 10, color: PP.ink } as TextStyle,
  segment:  { fontFamily: PP_FONT.display, fontSize: 10, color: PP.ink } as TextStyle,
};
