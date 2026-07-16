// categoryLabels.ts — Opcja A i18n: polski string zostaje KLUCZEM kanonicznym
// (zapisywany w danych produktu), a tu mapujemy klucz → etykieta w danym języku.
// Kolory/ikony kategorii nadal działają na polskich kluczach (PP_CAT, categoryIcon).
// Kategorie własne usera NIE są tłumaczone — fallback zwraca sam klucz.

import i18n from '../i18n';

type Labels = { pl: string; en: string };

// Klucze kanoniczne = polskie stringi używane w danych i pickerze (CATEGORIES),
// plus starsze kategorie z Cloud Function (dane sprzed ujednolicenia) dla poprawnego
// wyświetlania po angielsku.
export const CATEGORY_LABELS: Record<string, Labels> = {
  'Owoce i warzywa': { pl: 'Owoce i warzywa', en: 'Fruits & veg' },
  'Nabiał': { pl: 'Nabiał', en: 'Dairy' },
  'Mięso i ryby': { pl: 'Mięso i ryby', en: 'Meat & fish' },
  'Pieczywo': { pl: 'Pieczywo', en: 'Bakery' },
  'Napoje': { pl: 'Napoje', en: 'Drinks' },
  'Przekąski': { pl: 'Przekąski', en: 'Snacks' },
  'Mrożonki': { pl: 'Mrożonki', en: 'Frozen' },
  'Chemia': { pl: 'Chemia', en: 'Household' },
  'Inne': { pl: 'Inne', en: 'Other' },
  // legacy (Cloud Function) — tylko do wyświetlania starych danych
  'Mięso i wędliny': { pl: 'Mięso i wędliny', en: 'Meat & deli' },
  'Ryby': { pl: 'Ryby', en: 'Fish' },
  'Słodycze i przekąski': { pl: 'Słodycze i przekąski', en: 'Sweets & snacks' },
  'Chemia domowa': { pl: 'Chemia domowa', en: 'Household' },
  'Higiena osobista': { pl: 'Higiena osobista', en: 'Personal care' },
};

// Jednostki — tylko te, które różnią się po angielsku; reszta uniwersalna.
export const UNIT_LABELS: Record<string, Labels> = {
  szt: { pl: 'szt', en: 'pcs' },
  opak: { pl: 'opak', en: 'pack' },
};

function currentLang(lang?: string): 'pl' | 'en' {
  return (lang ?? i18n.language) === 'en' ? 'en' : 'pl';
}

/** Etykieta kategorii w danym języku. Fallback: sam klucz (kategorie własne / nieznane). */
export function categoryLabel(key: string | undefined, lang?: string): string {
  if (!key) return '';
  return CATEGORY_LABELS[key]?.[currentLang(lang)] ?? key;
}

/** Etykieta jednostki w danym języku. Fallback: sam klucz. */
export function unitLabel(key: string | undefined, lang?: string): string {
  if (!key) return '';
  return UNIT_LABELS[key]?.[currentLang(lang)] ?? key;
}
