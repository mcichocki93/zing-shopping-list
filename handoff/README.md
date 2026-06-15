# Zing — wdrożenie wyglądu „Pixel Pop" (handoff dla Claude Code)

To jest pakiet przekazania (handoff) dla developera/Claude Code. Celem jest wdrożenie nowego wyglądu **Pixel Pop** w istniejącej aplikacji **Zing** (React Native + Expo, Firebase) — na osobnym branchu, **równolegle** do obecnego stylu „pixel".

## Co tu jest
- `README.md` — ten plik: kontekst, strategia, kroki, checklista
- `INSTALL.md` — **instrukcja krok po kroku**: co skopiować, co zainstalować, jak podłączyć (zacznij tutaj przy wdrażaniu)
- `DESIGN_SPEC.md` — **wiążąca** specyfikacja: tokeny (kolory, fonty, cienie, radius), komponenty, layout obu ekranów, pułapki RN
- `visual-reference.html` — interaktywna makieta. **Otwórz w przeglądarce.** Źródło prawdy dla wyglądu, ale **nie kod do skopiowania** — to prototyp HTML/React-DOM. Odtwarzasz go natywnie w RN (gotowce poniżej).
- **`src/` — GOTOWY KOD REACT NATIVE do skopiowania 1:1** (zachowaj ścieżki):
  - `src/constants/pixelPopTheme.ts` — tokeny jako kod (kolory, fonty, cienie, style tekstu)
  - `src/fonts.ts` — hook ładujący fonty Silkscreen + Inter
  - `src/components/ui-pixelpop/` — komplet komponentów: `PixelIcon`, `HardShadow`, `GlassBar`, `SegmentedControl`, `SegmentProgress`, `Fab`, `HeroStat`, `SearchField`, `PixelCheckbox2`, `ListRow`, `CategoryCard`, `ComposeBar`, `PixelPopTabBar`, `index.ts`
  - `src/examples/` — `PixelPopDashboard.example.tsx` i `PixelPopDetail.example.tsx`: gotowe wzorce złożenia obu ekranów z komponentów (podłącz do swoich hooków)
- `PixelIcon.tsx` — kopia komponentu ikon (ten sam plik jest też w `src/components/ui-pixelpop/`)

> **Najszybsza ścieżka:** otwórz `INSTALL.md` i wykonuj po kolei. Kod z `src/` kopiujesz bez zmian; przepisujesz tylko dwa ekrany wg przykładów z `src/examples/`.

## Jak czytać makietę
Otwórz `visual-reference.html`. Kanwa ma kilka sekcji — **wdrażamy sekcję „Pixel Pop v2 · inspirowane Apple ⭐"** (dwa ekrany: **Dashboard** i **Szczegóły listy**). To dopracowana wersja Pixel Pop: duży tytuł, wyszukiwarka, pływające paski „pixel-glass", segmented control, pływający przycisk +. Sekcje z innymi kierunkami (Apple × Revolut, Neopixel, Retro Terminal) **ignoruj**.

Kod referencyjnych komponentów (`PopV2Dashboard`, `PopV2Detail`, `PopV2TabBar`, `PxIcon`, stałe `pp`, `catPp`, `ppShadow`, `ppGlass`) jest w `<script type="text/babel">` w tym samym pliku — możesz z niego odczytać dokładne wartości, ale przepisz je na natywne RN.

## Fidelity: HIGH
Kolory, typografia, odstępy, radiusy i cienie są finalne — odtwórz UI wiernie, ale natywnymi środkami RN. Wszystkie tokeny w `DESIGN_SPEC.md` są wiążące.

## Bardzo ważne — strategia
- **Nie usuwaj** istniejącego pixelowego systemu (`src/components/ui/Pixel*`, `BORDERS.radius = 0`). Pixel Pop to **nowy, równoległy theme** włączany flagą `usePixelPop`. Dzięki temu branch jest bezpieczny do merge'a i umożliwia A/B oraz łatwy rollback.
- Cała **logika danych zostaje bez zmian** (Firebase, `useShoppingList`, `useShoppingLists`, `useAIParser`, `useSpeechInput`, nawigacja danych). Zmieniamy **wyłącznie warstwę prezentacji**.

## Kroki

1. **Branch**
   ```
   git checkout -b feature/pixel-pop-redesign
   ```

2. **Zależności**
   ```
   npx expo install expo-blur react-native-svg @expo-google-fonts/silkscreen @expo-google-fonts/inter expo-font
   npm i @react-navigation/bottom-tabs
   ```
   - `react-native-svg` — ikony pixel-art (`PixelIcon.tsx`) i segmentowe progresy
   - `expo-blur` — efekt „pixel-glass" na pływających paskach (RN nie ma `backdrop-filter`)
   - `@react-navigation/bottom-tabs` — dolny pasek zakładek (Listy / Szablony / Profil); obecnie jest tylko native-stack
   - fonty: **Silkscreen** (display/marka/liczby) + **Inter** (UI)

3. **Fonty** — załaduj w `App.tsx` przez `useFonts` (`expo-font` / `@expo-google-fonts/*`), gate renderu do `fontsLoaded`.

4. **Tokeny** — utwórz `src/constants/pixelPopTheme.ts` wg `DESIGN_SPEC.md` (sekcja „Design Tokens").

5. **Ikony** — wrzuć `PixelIcon.tsx` do `src/components/ui-pixelpop/` (gotowy, bez zmian).

6. **Komponenty współdzielone** — `src/components/ui-pixelpop/`: `GlassBar`, `SegmentedControl`, `Fab`, `HeroStat`, `ListRow`, `CategoryCard`, `SegmentProgress`, `PixelCheckbox2`, `SearchField` (specyfikacje w `DESIGN_SPEC.md`).

7. **Nawigacja** — dodaj `@react-navigation/bottom-tabs` w `src/navigation/MainNavigator.tsx`: zakładki Listy / Szablony / Profil. Stack z listami ląduje wewnątrz zakładki „Listy". Dolny tab bar użyj `tabBar={props => <PixelPopTabBar {...props}/>}` (custom, glass).

8. **Ekrany** — przerób (za flagą `usePixelPop`):
   - `src/features/shoppingLists/screens/ListsDashboardScreen.tsx` → Dashboard
   - `src/features/shoppingLists/screens/ListDetailScreen.tsx` → Szczegóły
   - `src/features/aiInput/components/AIInputBar.tsx` → glass compose bar + segmented control

9. **Flaga** — `usePixelPop` w `ThemeContext` (domyślnie `false`); włącz lokalnie do testów. Opcjonalnie podłącz pod Firebase Remote Config dla rolloutu.

10. **Weryfikacja** — porównaj z `visual-reference.html` na iOS i Androidzie (zwłaszcza blur i cienie — patrz „Pułapki RN" w spec).

## Checklista akceptacji
- [ ] Branch `feature/pixel-pop-redesign`, flaga `usePixelPop` przełącza stary/nowy wygląd
- [ ] Fonty Silkscreen + Inter ładują się i są używane wg spec
- [ ] Dashboard: header z marką, wyszukiwarka, hero-stat z segmentowym progresem, lista w zgrupowanym bloku, pływający +, glass tab bar
- [ ] Szczegóły: duży tytuł + meta, karta postępu, sekcje kategorii z pixel-checkboxami, glass compose bar z segmented control
- [ ] Ink bordery (2–3px, `#120E22`), ostre narożniki, offsetowe twarde cienie zgodne z tokenami
- [ ] Akcent (domyślnie róż `#FF3B8F`) zmienialny przez ThemeContext
- [ ] Logika (Firebase, AI, dyktowanie, dodawanie/usuwanie) działa jak wcześniej
- [ ] iOS + Android sprawdzone (blur fallback na Androidzie)

Szczegóły wszystkich wartości i komponentów → `DESIGN_SPEC.md`.
