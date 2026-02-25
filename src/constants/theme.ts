export const COLORS = {
  primary: '#2E2E2E',
  accent: '#4CAF50',
  danger: '#D32F2F',
  background: '#F5F5F5',
  white: '#FFFFFF',
  disabled: '#6B6B6B',
  border: '#2E2E2E',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const BORDERS = {
  width: 2,
  radius: 0,
} as const;

export const TOUCH = {
  minTarget: 44,
} as const;

export const FONT_SIZE = {
  display: 40,
  h1: 28,
  h2: 20,
  h3: 18,
  body: 16,
  caption: 14,
} as const;

export const FONT_WEIGHT = {
  regular: '400' as const,
  bold: '700' as const,
  black: '900' as const,
};

export const TEXT_STYLES = {
  display: { fontSize: FONT_SIZE.display, fontWeight: FONT_WEIGHT.black },
  h1: { fontSize: FONT_SIZE.h1, fontWeight: FONT_WEIGHT.black },
  h2: { fontSize: FONT_SIZE.h2, fontWeight: FONT_WEIGHT.black },
  h3: { fontSize: FONT_SIZE.h3, fontWeight: FONT_WEIGHT.bold },
  body: { fontSize: FONT_SIZE.body, fontWeight: FONT_WEIGHT.regular },
  caption: { fontSize: FONT_SIZE.caption, fontWeight: FONT_WEIGHT.regular },
  label: { fontSize: FONT_SIZE.caption, fontWeight: FONT_WEIGHT.bold },
} as const;
