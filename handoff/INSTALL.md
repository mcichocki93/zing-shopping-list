# INSTALL — krok po kroku (Pixel Pop)

Gotowy kod jest w `src/`. Kopiujesz pliki do projektu z zachowaniem ścieżek, instalujesz zależności, podłączasz fonty + nawigację, i przepisujesz dwa ekrany na bazie przykładów. Minimum zgadywania.

## 0. Branch
```
git checkout -b feature/pixel-pop-redesign
```

## 1. Zależności
```
npx expo install expo-blur react-native-svg @expo-google-fonts/silkscreen @expo-google-fonts/inter expo-font
npm i @react-navigation/bottom-tabs
```
> `react-native-safe-area-context` i `@react-navigation/*` już są w projekcie.

## 2. Skopiuj pliki (zachowaj ścieżki)
```
handoff/src/constants/pixelPopTheme.ts          ->  src/constants/pixelPopTheme.ts
handoff/src/fonts.ts                            ->  src/fonts.ts
handoff/src/components/ui-pixelpop/*            ->  src/components/ui-pixelpop/
```
Folder `ui-pixelpop/` zawiera: `PixelIcon`, `HardShadow`, `GlassBar`, `SegmentedControl`, `SegmentProgress`, `Fab`, `HeroStat`, `SearchField`, `PixelCheckbox2`, `ListRow`, `CategoryCard`, `ComposeBar`, `PixelPopTabBar`, `index.ts`.

Przykłady (NIE kopiuj do produkcji — to wzorce):
```
handoff/src/examples/PixelPopDashboard.example.tsx
handoff/src/examples/PixelPopDetail.example.tsx
```

## 3. Fonty w App.tsx
```tsx
import { usePixelPopFonts } from './src/fonts';

export default function App() {
  const fontsLoaded = usePixelPopFonts();
  if (!fontsLoaded) return null; // lub trzymaj splash przez expo-splash-screen
  // ...reszta jak dotąd
}
```

## 4. Flaga włączająca nowy wygląd
Dodaj do `ThemeContext` (lub osobny mały kontekst) boolean `usePixelPop` (domyślnie `false`).
Akcent: dodaj `pixelPopAccent` (domyślnie `PP.pink = '#FF3B8F'`); pozwól zmieniać w ustawieniach.

## 5. Dolna nawigacja (bottom tabs)
W `src/navigation/MainNavigator.tsx` owiń obecny stos zakładkami:
```tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PixelPopTabBar } from '../components/ui-pixelpop';

const Tab = createBottomTabNavigator();

// ListsStack = Twój dotychczasowy native-stack (Dashboard + Detail)
function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(p) => <PixelPopTabBar {...p} />}>
      <Tab.Screen name="Listy" component={ListsStack} />
      <Tab.Screen name="Szablony" component={TemplatesScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
```
> Jeśli ekranów „Szablony"/„Profil" jeszcze nie ma jako tras, użyj istniejących modali/widoków albo prostych ekranów-placeholderów. Tab bar pokazuj tylko gdy `usePixelPop === true` (w przeciwnym razie zostaw obecną nawigację).

## 6. Przepisz ekrany (za flagą)
W `ListsDashboardScreen.tsx` i `ListDetailScreen.tsx`:
```tsx
if (usePixelPop) {
  return <PixelPopDashboard ...propsy z istniejących hooków /> ;
}
// ...inaczej dotychczasowy render
```
Zmapuj propsy wg przykładów:
- **Dashboard**: `lists` z `useShoppingLists()`; `onOpenList` → `navigation.navigate('ListDetail', { listId })`; `onCreate` → istniejący modal „Nowa lista"; `onShare`/`onOpenSettings` → istniejące akcje.
- **Detail**: `groups` z `sortedCategories` (`useShoppingList`); `onToggle` → `handleToggleItem`; `onEdit` → `onEditItem`; compose: tryb AI → `useAIParser().parse(text)`, mic → `useSpeechInput()`, tryb Ręcznie → istniejący formularz z pickerami.

Mapowanie kategoria → ikona pixel (użyj w `ListRow`/`CategoryCard`):
```
Owoce i warzywa -> apple
Nabiał          -> milk
Pieczywo        -> bread
Napoje          -> drink
(inne)          -> cart
```

## 7. AIInputBar
Zachowaj całą logikę (taby, dyktowanie, parsowanie, pickery, `clearTrigger`). W trybie `usePixelPop` renderuj `ComposeBar` zamiast obecnego UI; pole ręczne (ilość/jednostka/kategoria) zostaw jak jest, tylko ostyluj pixelowo (ink border, radius 0).

## 8. Test
- iOS i Android (blur w GlassBar — na Androidzie nakładka jest mocniejsza automatycznie).
- Porównaj 1:1 z `visual-reference.html` (sekcja „Pixel Pop v2").
- Sprawdź łamanie tekstu przy Silkscreen (font jest szeroki).

## Najczęstsze błędy (i jak ich uniknąć)
- **Cień bez efektu / ucięty** → używaj `HardShadow` (warstwa), nie `shadow*`/`elevation`. Nie nadawaj `overflow:'hidden'` na wrapperze z cieniem.
- **Brak fontu / kwadraciki** → font nie załadowany; sprawdź `usePixelPopFonts()` i nazwy rodzin w `pixelPopTheme.ts`.
- **Blur nie działa na Androidzie** → to normalne; nakładka 0.9 ratuje czytelność. Można podbić intensity.
- **`gap` nie działa** → RN < 0.71; zamień na marginy.
- **Ikony niewidoczne** → brak `react-native-svg` albo zła nazwa ikony (patrz lista w `PixelIcon.tsx`).
