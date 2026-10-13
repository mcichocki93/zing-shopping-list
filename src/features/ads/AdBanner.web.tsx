// Web: odpowiedniki bez reklam. Treść nie musi robić miejsca na baner, więc
// padding jest taki jak dla Premium.
export const AD_CONTENT_PAD_WITH_AD = 96;
export const AD_CONTENT_PAD_NO_AD = 96;

export function adContentPad(_isPremium: boolean): number {
  return AD_CONTENT_PAD_NO_AD;
}

export function AdBanner() {
  return null;
}

export function AnchoredAdBanner() {
  return null;
}
