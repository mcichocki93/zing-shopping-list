# Pixel Pop — Design Spec (wiążąca)

Wszystkie wartości pochodzą z makiety `visual-reference.html`, sekcja **„Pixel Pop v2"**. Wartości w px (RN: liczby bez jednostki). Odtwórz wiernie, natywnymi środkami RN.

---

## 1. Design Tokens — `src/constants/pixelPopTheme.ts`

### Kolory
```ts
export const PP = {
  ink:    '#120E22', // bordery, tekst, „twardy" cień — granatowa czerń
  paper:  '#FFF8EE', // tło ekranu (ciepła kość słoniowa)
  panel:  '#FFFFFF', // karty
  muted:  '#6B6580', // tekst drugorzędny, ilości
  // akcenty (akcent główny zmienialny w ThemeContext, domyślnie pink):
  pink:   '#FF3B8F', // domyślny akcent
  yellow: '#FFD12E',
  violet: '#6B4BFF',
  cyan:   '#3BE3FF',
} as const;
```

### Kolory kategorii (tło kafelka/nagłówka)
```ts
export const PP_CAT = {
  'Owoce i warzywa': '#7EE29A',
  'Nabiał':          '#3BE3FF',
  'Pieczywo':        '#FFD12E',
  'Mięso i wędliny': '#FF9CCB',
  'Napoje':          '#C7A8FF',
  // fallback dla pozostałych — patrz istniejący categoryColors.ts, ta sama logika hash
} as const;
```
Ikona/tekst na kafelku kategorii zawsze `PP.ink`.

### Typografia
```
Display / marka / liczby / etykiety przycisków:  Silkscreen (400)
Tytuły ekranów i pozycji (large title):          Inter 800, letterSpacing -0.02em
UI / tekst podstawowy:                           Inter (400/500/600/700)
Mono (kody, liczniki, meta):                      Inter 600 tabular-nums LUB JetBrains Mono jeśli wolisz

Rozmiary (px):
  marka „ZING"            Silkscreen 13–16
  large title ekranu      Inter 800  24–28
  hero liczba (23/48)     Silkscreen 42–44 (mniejsza część /48: 18–20, opacity .55)
  nagłówek kategorii      Silkscreen 12
  tytuł pozycji listy     Inter 800  15  (w PopV2 używamy titleFont = Inter 800)
  tekst pozycji           Inter 600  14
  ilość / meta            Inter 600  10  kolor muted
  etykieta zakładki       Inter/mono 600 10
  label segmentu          Silkscreen 10
```
> Uwaga: Silkscreen to font „display". Używaj go OSZCZĘDNIE — marka, duże liczby, krótkie etykiety (TEN TYDZIEŃ, + DODAJ, nagłówki kategorii). Cała czytelna treść = Inter. To jest klucz do „nowoczesnego pixela", a nie „pixel wszędzie".

### Cień (sygnatura) — twardy offset, ZERO blur
```ts
// odpowiednik CSS: `${o}px ${o}px 0 0 #120E22`
// RN nie zrobi tego natywnym shadow (shadow ma blur). Implementacja: WARSTWA.
// Renderuj element, a pod nim absolutnie pozycjonowany duplikat tła
// przesunięty o (o, o) w kolorze ink. Helper w komponentach (patrz §2 HardShadow).
offset typowy: 3 (przyciski ikon), 4 (karty), 5 (hero/FAB)
```

### Bordery i narożniki
```
borderColor: PP.ink
borderWidth: 2.5 (większość) / 3 (karty, hero, FAB, kafelki kategorii)
borderRadius: 0  ← OSTRE narożniki to esencja stylu. NIE zaokrąglać kart ani pól.
```

### Odstępy
Siatka 8px. Padding ekranu: 16–18 po bokach. Gap między kartami listy: 10–12. Gap między sekcjami kategorii: 14.

### Touch targets
Min 44×44 (zachowaj istniejącą stałą `TOUCH.minTarget`).

---

## 2. Komponenty współdzielone — `src/components/ui-pixelpop/`

### HardShadow (fundament — twardy offset cień)
RN nie ma `box-shadow: x y 0 0 color`. Zrób wrapper:
```tsx
// <HardShadow offset={4} color={PP.ink}><Card/></HardShadow>
// Renderuje View z position:relative; pod children kładzie absolutny View
// (ten sam kształt/rozmiar) przesunięty translate(offset, offset),
// tło = color, ZA children (zIndex niżej). children mają własne tło + border.
```
Alternatywa (prostsza, jeśli pasuje): obramowany View z `borderRightWidth`/`borderBottomWidth` zwiększonym do offsetu — ale wariant z warstwą jest wierniejszy.

### GlassBar — pływający pasek „pixel-glass"
- `position:'absolute'`, przyklejony do dołu; w makiecie v2 pasek jest pełnej szerokości z `borderTop: 2px ink` i półprzezroczystym tłem.
- Tło: `<BlurView intensity={18} tint="light">` + nakładka `rgba(255,248,238,0.7)` (= `ppGlass`).
- **Narożniki ostre** (radius 0) — to „pixel glass", nie iOS-owe zaokrąglenie.
- Android: jeśli blur słaby → podbij nakładkę do `rgba(255,248,238,0.9)`.
- `paddingBottom` uwzględnij safe-area (insets.bottom) zamiast sztywnego 30.

### PixelPopTabBar (custom bottom tab bar)
- 3 zakładki: Listy (`cart`), Szablony (`template`), Profil (`user`).
- Bazuje na GlassBar. Aktywna zakładka: kafelek z tłem = akcent + `2px ink border`, pod spodem etykieta (Inter/mono 600, 10, ink). Nieaktywna: ikona `PP.muted`, bez tła.
- Wysokość treści ~ ikona 16 + etykieta; cały pasek + safe area.

### SegmentedControl (AI / Ręcznie)
- Wiersz dwóch segmentów w jednej ramce `2.5px ink` (radius 0).
- Aktywny: tło = akcent, tekst ink, Silkscreen 10. Nieaktywny: tło transparent, tekst muted, lewy segment `borderLeft: 2.5px ink`.
- Etykiety: „✦ AI", „+ RĘCZNIE".

### Fab (pływający +)
- 54×54, tło = akcent, `3px ink border`, HardShadow offset 4, ikona `plus` 24 ink, radius 0.
- Pozycja: prawy dół, nad tab barem (`bottom ≈ tabBarHeight + 16`, `right: 16`).

### HeroStat (karta „TEN TYDZIEŃ")
- Tło = akcent, `3px ink`, HardShadow offset 5, padding 14×16, radius 0, `overflow:hidden`.
- Zawartość: etykieta Silkscreen 10/mono („TEN TYDZIEŃ"), wielka liczba Silkscreen 42 `23` + `/48` (18, opacity .55), podpis Inter 600 12, opcjonalny dekoracyjny duży `cart` w rogu (opacity .28, rotate 12°).

### SegmentProgress (pasek postępu z segmentów)
- Rząd N segmentów (np. 12), `gap: 2–3`, każdy `flex:1`, `height: 6–10`, `1.5px ink border`; wypełnione = akcent (lub ink w hero), puste = `paper`/`soft`.

### ListRow (wiersz w zgrupowanym bloku list)
- W Dashboard listy są w **jednym białym bloku** (`panel`, `3px ink`, HardShadow 4); wiersze rozdzielone `2px dashed paper`.
- Wiersz: kafelek ikony kategorii 44–48 (tło = kolor kategorii/tint, `2.5px ink`), tytuł (Inter 800, 15), pod nim mini SegmentProgress + `d/c` (mono 10) albo „✓ KOMPLET"; pill z kodem listy (tło ink, tekst paper, mono 10) po prawej; chevron na końcu.
- Stan ukończony: `opacity: 0.6`, ikona `check`.

### CategoryCard (sekcja kategorii — ekran szczegółów)
- Nagłówek (osobny pasek nad kartą lub w karcie): kafelek ikony 24–28 (tło = kolor kategorii) + nazwa (Silkscreen 12 / mono uppercase) + licznik `niekupione/total` (mono 10).
- Karta: `panel`, `3px ink`, HardShadow 3. Wiersze: PixelCheckbox2 + nazwa (Inter 600/800 15; kupione = przekreślone, muted) + ilość po prawej (mono 10 muted) + ikona `edit`. Separator `2px dashed paper`. Wiersz kupiony: tło `paper`.

### PixelCheckbox2
- 22×22, `2.5px ink`, radius 0. Zaznaczony: tło = ink, biały `check` (PxIcon, paper). Niezaznaczony: tło panel.
- (Różni się od istniejącego `PixelCheckbox` wypełnieniem ink zamiast akcentu — można sparametryzować istniejący.)

### SearchField
- Wiersz: ikona `search` (muted) + tekst placeholder „Szukaj listy…" (13, muted), tło `panel`, `2px ink`, padding 9×12, radius 0.

---

## 3. Ekran A — Dashboard (`ListsDashboardScreen.tsx`)

Tło `PP.paper`. Scroll z `paddingBottom` = wysokość tab bara + ~24. Kolejność:

1. **Header** (`paddingTop: insets.top + ~20`, px 16): po lewej logo 40 (tło akcent, `3px ink`, HardShadow 3, `rotate(-4deg)`, ikona `logo`) + „ZING" (Silkscreen 16) i pod spodem „cześć, {displayName} ✦" (Inter 10, muted). Po prawej okrągłe/kwadratowe przyciski ikon (np. `share`, `gear`) 40, `3px ink`, HardShadow 3.
2. **SearchField**.
3. **HeroStat** „TEN TYDZIEŃ" (liczby z realnych danych: kupione/total w bieżącym tygodniu lub aktywnej liście — patrz uwaga niżej).
4. **Nagłówek sekcji** „PRZYPIĘTE/Listy" (Silkscreen 12) + po prawej „SORTUJ ▾" lub licznik (mono 10).
5. **Zgrupowany blok list** (ListRow ×N). Dane z `useShoppingLists()`. Każda lista: ikona wg dominującej kategorii lub `cart`, tytuł, progress = `kupione/wszystkie`, kod (`inviteCode`) jako pill.
6. **Fab** (+) → istniejący flow „Nowa lista" (modal tworzenia).
7. **PixelPopTabBar** (Listy aktywne).

> Hero-stat liczby: użyj realnych danych (np. suma `isCompleted` / suma items po wszystkich listach, albo z konkretnej „bieżącej" listy). Jeśli brak sensownej metryki tygodniowej, pokaż „X / Y kupionych" z agregacji list — nie wymyślaj fikcyjnych liczb.

Quick actions: w v1 były trzy kolorowe pill-e (Nowa/Dołącz/Szablon). W v2 zastąpione przez Fab (Nowa) + tab bar (Szablony) + header. **Dołącz do listy** przenieś do menu w headerze (`gear`/`menu`) albo zostaw jako pill pod hero — zachowaj istniejący flow `lookupInvite`/`joinList`.

---

## 4. Ekran B — Szczegóły listy (`ListDetailScreen.tsx`)

Tło `PP.paper`. Scroll z `paddingBottom` = wysokość compose bara + ~24. Kolejność:

1. **Nav** (`paddingTop: insets.top + ~20`): po lewej back (`chevronL`) 38, `3px ink`, HardShadow 3; po prawej `heart` (ulubione — opcjonalne), `share` (istniejący `onShare`), `menu` (akcje: zapisz szablon, motyw — istniejące).
2. **Tytuł** listy (Inter 800, 27–28, może łamać się w 2 linie) + meta: pill z kodem (`KOD · {inviteCode}`, tło ink/akcent), liczba osób (`memberIds.length`), „X/Y" postęp.
3. **Karta postępu** (`panel`, `3px ink`, HardShadow 4): „POSTĘP" (Silkscreen 10) + `kupione/total` (Silkscreen 18) + SegmentProgress (12 segmentów, wypełnione akcentem).
4. **Sekcje kategorii** (CategoryCard ×N) z `sortedCategories` (hook `useShoppingList`): grupa „Kupione" na końcu jak teraz. Wiersze = pozycje; toggle `handleToggleItem`, usuwanie/edycja `handleRemoveItem`/`onEditItem` (istniejące modale).
5. **Glass compose bar** (GlassBar, pinned): SegmentedControl [✦ AI | + RĘCZNIE] + pole tekstowe (placeholder „2x mleko, chleb, jabłka…") + przycisk `mic` 44 (tło yellow, `2.5px ink`; trzymaj=dyktuj, `useSpeechInput`) + przycisk wyślij `chevron` 44 (tło akcent). Tryb AI → `useAIParser.parse`; tryb Ręcznie → istniejący `onAddManual` (z pickerami ilości/jednostki/kategorii jak w obecnym `AIInputBar`).

> `AIInputBar.tsx`: zachowaj całą logikę (taby, dyktowanie, parsowanie, pickery, `clearTrigger`). Zmień tylko prezentację na SegmentedControl + glass + pixel inputy.

---

## 5. Pułapki React Native (KONIECZNIE)

1. **Twardy cień offset** — `box-shadow: x y 0 0 color` NIE istnieje w RN. `shadowRadius:0` na iOS daje twardą krawędź, ale brak kontroli kierunku na Androidzie (tylko `elevation`, zawsze z blur). **Najwierniej: HardShadow przez warstwę** (absolutny duplikat tła przesunięty o offset). Użyj wszędzie tam, gdzie makieta ma `ppShadow`.
2. **„Pixel glass"** — brak `backdrop-filter`. Użyj `expo-blur` `<BlurView>` + półprzezroczysta nakładka `rgba(255,248,238,0.7)`. Narożniki ZOSTAJĄ ostre. Android: blur słabszy → zwiększ krycie nakładki.
3. **Font pixel** — Silkscreen przez `expo-font`/`@expo-google-fonts/silkscreen`. Gate renderu do `fontsLoaded`. Uważaj na metryki — Silkscreen jest szeroki; testuj łamanie etykiet.
4. **`gap`** — działa dopiero w nowszym RN (0.71+). Jeśli projekt starszy, zamień na marginy. Sprawdź wersję w `package.json`.
5. **`overflow:'hidden'` + cień** — na iOS hidden ucina cień. Dlatego cień rób warstwą POD kartą (HardShadow), a `overflow:hidden` tylko na samej karcie gdy trzeba (np. dekoracja hero).
6. **`shapeRendering:'crispEdges'`** (z PxIcon) nie istnieje w react-native-svg — pomiń; piksele i tak są ostre przy całkowitych współrzędnych.
7. **Letter-spacing ujemny** (Inter 800 -0.02em) — w RN to `letterSpacing` w jednostkach px (np. `-0.5`), nie em. Przelicz.
8. **Safe area** — używaj `useSafeAreaInsets()` (już w projekcie) zamiast sztywnych 54/30 z makiety.

---

## 6. Mapowanie plików

| Makieta (HTML) | Wdrożenie (RN) |
|---|---|
| `PxIcon` | `src/components/ui-pixelpop/PixelIcon.tsx` (gotowy w pakiecie) |
| stałe `pp`, `catPp`, `ppShadow`, `ppGlass` | `src/constants/pixelPopTheme.ts` |
| `PopV2TabBar` | `src/components/ui-pixelpop/PixelPopTabBar.tsx` + `MainNavigator.tsx` |
| `PopV2Dashboard` | `ListsDashboardScreen.tsx` (za flagą) |
| `PopV2Detail` | `ListDetailScreen.tsx` (za flagą) |
| segmented + compose | `AIInputBar.tsx` + `SegmentedControl`, `GlassBar` |
| `display`/`titleFont`/`ui`/`mono` | style tekstu w `pixelPopTheme.ts` |

Logika i hooki bez zmian: `useShoppingList`, `useShoppingLists`, `useAIParser`, `useSpeechInput`, `useCategories`, `useTemplates`, `usePremium`, `useAuth`, serwisy Firebase.
