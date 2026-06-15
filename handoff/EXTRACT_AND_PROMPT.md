# Gdzie co wypakować + jaki prompt napisać

## A. Rozpakowanie do repo

Pobierz ZIP, rozpakuj. W środku jest folder `handoff/`. Skopiuj go **w całości** do katalogu głównego swojego repo (obok `src/`, `App.tsx`, `package.json`). Czyli docelowo:

```
zing-shopping-list/
├── App.tsx
├── package.json
├── src/                 ← Twój istniejący kod
└── handoff/             ← wrzucasz cały ten folder
    ├── README.md
    ├── INSTALL.md
    ├── EXTRACT_AND_PROMPT.md   (ten plik)
    ├── DESIGN_SPEC.md
    ├── visual-reference.html
    └── src/...                 (gotowy kod do skopiowania)
```

**Nie kopiuj ręcznie plików z `handoff/src/` do `src/`** — niech zrobi to Claude Code wg `INSTALL.md` (pilnuje ścieżek i podłączeń). Twoim zadaniem jest tylko wrzucić folder `handoff/` do repo i odpalić prompt poniżej.

Commit na nowym branchu, żeby mieć czysty punkt wyjścia:
```
git checkout -b feature/pixel-pop-redesign
git add handoff && git commit -m "handoff: pixel pop design package"
```

## B. Docelowe miejsca plików (robi to Claude Code)

| Z pakietu | Do repo |
|---|---|
| `handoff/src/constants/pixelPopTheme.ts` | `src/constants/pixelPopTheme.ts` |
| `handoff/src/fonts.ts` | `src/fonts.ts` |
| `handoff/src/components/ui-pixelpop/*` | `src/components/ui-pixelpop/*` |
| `handoff/src/contexts/pixelPopFlag.example.tsx` | `src/contexts/PixelPopContext.tsx` (zmień nazwę, usuń `.example`) |
| `handoff/src/features/templates/TemplatesScreen.example.tsx` | `src/features/templates/screens/TemplatesScreen.tsx` |
| `handoff/src/features/profile/ProfileScreen.example.tsx` | `src/features/profile/screens/ProfileScreen.tsx` |
| `handoff/src/navigation/MainNavigator.example.tsx` | wzorzec → wmontuj w `src/navigation/MainNavigator.tsx` |
| `handoff/src/examples/PixelPopDashboard.example.tsx` | wzorzec → wmontuj w `ListsDashboardScreen.tsx` |
| `handoff/src/examples/PixelPopDetail.example.tsx` | wzorzec → wmontuj w `ListDetailScreen.tsx` |
| `handoff/src/App.example.tsx` | wzorzec → wmontuj w `App.tsx` |

Pliki `*.example.tsx` i `*.example` to **wzorce** — przy przenoszeniu usuń sufiks `.example` i popraw importy (w wzorcach importują `pixelPopFlag.example`; po zmianie nazwy ma być `PixelPopContext`).

## C. Prompt do wklejenia w Claude Code

Skopiuj poniższy tekst do Claude Code otwartego w repo `zing-shopping-list`:

---

```
Wdrażasz nowy wygląd „Pixel Pop" w tej aplikacji (React Native + Expo). Cały pakiet
przekazania jest w folderze ./handoff. Zacznij od przeczytania, w tej kolejności:
handoff/README.md, handoff/INSTALL.md, handoff/DESIGN_SPEC.md. Otwórz też
handoff/visual-reference.html i kieruj się sekcją „Pixel Pop v2" (ekrany Dashboard
i Szczegóły listy) jako źródłem prawdy dla wyglądu.

Zasady:
- Pracuj na branchu feature/pixel-pop-redesign.
- NIE usuwaj istniejącego stylu „pixel" ani komponentów Pixel*. Nowy wygląd ma być
  RÓWNOLEGŁY, włączany flagą usePixelPop (domyślnie wyłączoną).
- NIE zmieniaj logiki danych (Firebase, useShoppingList, useShoppingLists,
  useAIParser, useSpeechInput, useTemplates, usePremium, useAuth, serwisy). Zmieniasz
  tylko warstwę prezentacji.

Wykonaj kroki z handoff/INSTALL.md:
1. Zainstaluj zależności (expo-blur, react-native-svg, @react-navigation/bottom-tabs,
   @expo-google-fonts/silkscreen, @expo-google-fonts/inter, expo-font).
2. Skopiuj gotowy kod z handoff/src do src zachowując ścieżki wg tabeli w
   handoff/EXTRACT_AND_PROMPT.md (pliki *.example przenieś bez sufiksu .example i
   popraw importy: pixelPopFlag.example -> PixelPopContext).
3. Podłącz fonty w App.tsx (usePixelPopFonts) i owiń aplikację w PixelPopProvider.
4. Dodaj dolne zakładki (Listy/Szablony/Profil) w MainNavigator wg wzorca, z custom
   PixelPopTabBar; pokazuj je tylko gdy usePixelPop().enabled === true.
5. Przepisz ListsDashboardScreen.tsx i ListDetailScreen.tsx tak, by przy
   usePixelPop().enabled renderowały warianty Pixel Pop (wg przykładów w
   handoff/src/examples), podłączone do istniejących hooków i akcji.
6. W AIInputBar.tsx zachowaj logikę, ale w trybie Pixel Pop renderuj ComposeBar
   (segmented AI/Ręcznie + glass).

Po wdrożeniu uruchom aplikację, ustaw flagę usePixelPop na true (np. tymczasowo w
PixelPopProvider) i porównaj oba ekrany z makietą. Zwróć uwagę na pułapki RN opisane
w handoff/DESIGN_SPEC.md sekcja 5 (twardy cień przez HardShadow, blur z fallbackiem
na Androidzie, ładowanie fontu Silkscreen). Na koniec pokaż listę zmienionych/nowych
plików i krótką instrukcję jak włączyć/wyłączyć nowy wygląd.
```

---

## D. Po wdrożeniu (szybki test)
- Włącz flagę (`usePixelPop` → true) i sprawdź oba ekrany na iOS i Androidzie.
- Jeśli cień znika / jest rozmyty → upewnij się, że użyto `HardShadow`, nie `shadow*`.
- Jeśli font to kwadraciki → fonty nie załadowane (gate `usePixelPopFonts`).
- Jeśli blur „nic nie robi" na Androidzie → to normalne, nakładka 0.9 trzyma czytelność.
