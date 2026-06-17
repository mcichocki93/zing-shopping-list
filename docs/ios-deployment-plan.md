# Plan wdrożenia Zing na iOS (App Store)

> Stan wyjścia: aplikacja działa na Androdzie (Play Store). iOS jeszcze nie budowany.
> Ważne: folder `ios/` **nie istnieje** w repo (commitowany jest tylko `android/`),
> więc iOS będzie generowany przez `expo prebuild` — **config pluginy zadziałają**
> (AdMob, Apple/Google Sign-In, mikrofon konfigurują się automatycznie). To NIE
> powtórzy pułapki z ręcznym manifestem, którą mieliśmy na Androidzie.

## Faza 0 — Konta i koszty (warunek wstępny)
- **Apple Developer Program** — 99 USD/rok (obowiązkowe)
- **Mac niepotrzebny** — EAS Build buduje iOS w chmurze (cloud Mac)
- Rekord aplikacji w **App Store Connect**

## Faza 1 — Konfiguracja iOS w kodzie
Dodać blok `ios` do `app.config.ts` (dziś jest tylko `android`):
- `bundleIdentifier: 'com.cichy093.zing'`
- `buildNumber`, ikona, `infoPlist` z uprawnieniami
- **Google Sign-In iOS**: iOS client ID + URL scheme (reversed client ID) — plugin
  `@react-native-google-signin` to ogarnia, podać `iosUrlScheme`
- **Apple Sign-In**: ✅ już zaimplementowane (`signInWithApple`). Apple WYMAGA go,
  skoro jest Google login — masz z głowy
- Uprawnienia (plugin doda automatycznie): mikrofon + rozpoznawanie mowy
  (`expo-speech-recognition`)

## Faza 2 — Reklamy na iOS (AdMob)
- Utworzyć **aplikację iOS w AdMob** → nowy iOS App ID + iOS banner unit ID
- Dodać `iosAppId` do pluginu `react-native-google-mobile-ads` w `app.config.ts`
- Rozszerzyć `src/features/ads/constants.ts` o iOS prod unit (dziś `Platform.select`
  ma tylko `android`)
- ⚠️ **App Tracking Transparency (ATT)** — iOS 14.5+ wymaga promptu o zgodę PRZED
  użyciem IDFA do reklam spersonalizowanych:
  - `NSUserTrackingUsageDescription` w Info.plist
  - Wywołać ATT prompt (UMP / `expo-tracking-transparency`) przed ładowaniem reklam
- `SKAdNetworkItems` — plugin AdMob dodaje automatycznie

## Faza 3 — Subskrypcja na iOS (NAJWIĘCEJ NOWEJ PRACY)
Największa różnica względem Androida:
- **App Store Connect**: utworzyć subskrypcję auto-renewable, grupę subskrypcji, cenę.
  Product ID — ten sam `zing_premium_monthly` lub osobny
- **Weryfikacja serwerowa Apple** — `verifyAndGrantPremium` obsługuje TYLKO Google Play
  (`androidpublisher`). Dla iOS trzeba dodać weryfikację przez **App Store Server API**
  (StoreKit 2 / verify transaction):
  - Nowa Cloud Function albo gałąź `platform === 'ios'` w istniejącej
  - Klucz App Store Server API (z App Store Connect) jako kolejny sekret Firebase
- `expo-iap` po stronie klienta obsługuje StoreKit, ale ścieżka weryfikacji jest inna
  niż Google — trzeba ją dopisać w `src/features/premium/services/iap.ts`

## Faza 4 — App Store Connect (listing + zgodność)
- **Privacy Nutrition Labels** — odpowiednik Data Safety (advertising ID, dane usera)
- Screenshoty iPhone (różne rozmiary), opis, kategoria
- **Account deletion**: ✅ masz (Apple też wymaga)
- Link do polityki prywatności: ✅ masz
- Subskrypcja: warunki, link do polityki, działający „Restore Purchases" (✅ przycisk jest)

## Faza 5 — Build, test, wysyłka
- `eas build --platform ios --profile production` (poprosi o logowanie Apple +
  utworzy certyfikaty/provisioning automatycznie)
- `eas submit --platform ios` → wysyłka do App Store Connect
- **TestFlight** — test wewnętrzny (w tym zakup sandbox z kontem testowym App Store)
- **App Review** — Apple recenzuje ręcznie i surowiej niż Google (1–3 dni, możliwe
  odrzucenia z prośbą o poprawki)

## Podsumowanie nakładu

| Obszar | Stan |
|---|---|
| Struktura (prebuild, brak ios/) | ✅ sprzyja — pluginy zadziałają |
| Apple Sign-In | ✅ gotowe |
| Usuwanie konta, polityka prywatności, restore | ✅ gotowe |
| Konfiguracja iOS (bundle, Google client, ATT) | 🔨 średnie |
| AdMob iOS + ATT | 🔨 średnie |
| **Weryfikacja IAP Apple (serwer)** | 🔴 nowy kod backendu — największa pozycja |
| App Store Connect (listing, privacy labels, subskrypcja) | 🔨 do zrobienia |
| Apple Developer account | 💳 99 USD/rok |

**Wniosek:** iOS to realnie większy projekt niż Android — głównie przez weryfikację
zakupów Apple po stronie serwera (osobny mechanizm niż Google Play) oraz ATT. Reszta
(struktura, Apple Sign-In, usuwanie konta) sprzyja.

## Kolejność rekomendowana
1. Apple Developer account (Faza 0)
2. Faza 1 — konfiguracja iOS w `app.config.ts` (czysto konfiguracyjne, nie rusza Androida)
3. Faza 2 — AdMob iOS + ATT
4. Faza 3 — IAP Apple (backend) — najtrudniejsze, zaplanować osobno
5. Faza 4 — listing w App Store Connect
6. Faza 5 — build (EAS) → TestFlight → review
