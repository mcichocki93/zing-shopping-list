// Web: brak AdMob (SDK nie ma wersji przeglądarkowej, a jego moduł importuje
// wewnętrzne API react-native, czego bundler web nie przepuszcza).
// Monetyzacja webu idzie inną drogą — reklamy są tu po prostu wyłączone.
export async function initAds(): Promise<void> {
  /* no-op */
}
