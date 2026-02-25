export const THEME_NAMES = [
  'ZIELONY',
  'NIEBIESKI',
  'FIOLETOWY',
  'POMARAŃCZOWY',
  'CZERWONY',
  'RÓŻOWY',
] as const;

export type ThemeName = (typeof THEME_NAMES)[number];

export interface AppTheme {
  name: ThemeName;
  accent: string;
  accentLight: string;
  accentMuted: string;
  swatch: string;
}

export const THEMES: Record<ThemeName, AppTheme> = {
  ZIELONY: {
    name: 'ZIELONY',
    accent: '#4CAF50',
    accentLight: '#E8F5E9',
    accentMuted: '#A5D6A7',
    swatch: '#4CAF50',
  },
  NIEBIESKI: {
    name: 'NIEBIESKI',
    accent: '#2196F3',
    accentLight: '#E3F2FD',
    accentMuted: '#90CAF9',
    swatch: '#2196F3',
  },
  FIOLETOWY: {
    name: 'FIOLETOWY',
    accent: '#9C27B0',
    accentLight: '#F3E5F5',
    accentMuted: '#CE93D8',
    swatch: '#9C27B0',
  },
  POMARAŃCZOWY: {
    name: 'POMARAŃCZOWY',
    accent: '#FF9800',
    accentLight: '#FFF3E0',
    accentMuted: '#FFCC80',
    swatch: '#FF9800',
  },
  CZERWONY: {
    name: 'CZERWONY',
    accent: '#F44336',
    accentLight: '#FFEBEE',
    accentMuted: '#EF9A9A',
    swatch: '#F44336',
  },
  RÓŻOWY: {
    name: 'RÓŻOWY',
    accent: '#E91E63',
    accentLight: '#FCE4EC',
    accentMuted: '#F48FB1',
    swatch: '#E91E63',
  },
};

export const DEFAULT_THEME: ThemeName = 'ZIELONY';
