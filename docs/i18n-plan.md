# Plan wprowadzenia angielskiego (i18n)

> Stan wyjścia: cały UI po polsku, zaszyty na sztywno (~50 plików, ~400–600 stringów).
> Zero i18n. Aplikacja wydana w PL (produkcja).

## Stack
- **`i18next` + `react-i18next`** — biblioteka i18n
- **`expo-localization`** — wykrycie języka urządzenia
- Tłumaczenia: `src/locales/pl.json`, `src/locales/en.json`

## Wybór języka
- Auto-detekcja z urządzenia (`expo-localization`)
- **Ręczny przełącznik** w ustawieniach profilu — zapis w dokumencie usera (jak `theme`/`pixelPopAccent`)
- Fallback: PL

## Kategorie — DECYZJA: Opcja A (bez migracji danych)
Polski string zostaje **kluczem kanonicznym**; dokładamy mapę etykiet. `item.category`
dalej trzyma np. `'Nabiał'` → **zero migracji istniejących list**.

Jedno źródło prawdy (zastępuje rozjazd klient↔serwer + `PP_CAT` + `categoryIcon`):
```ts
CATEGORY_DEFS = [
  { key: 'Nabiał',   labels: { pl: 'Nabiał',   en: 'Dairy' },      color: '#3BE3FF', icon: 'milk' },
  { key: 'Pieczywo', labels: { pl: 'Pieczywo', en: 'Bread' },      color: '#FFD12E', icon: 'bread' },
  // ... reszta kategorii
]
```
- Wyświetlanie: `labels[lang]`
- Kolory/ikony: z defa
- **AI (Cloud Function):** dostaje `labels[userLang]`; Gemini zwraca etykietę; funkcja
  mapuje etykietę → `key` do zapisu (zawsze zapisujemy klucz kanoniczny PL).
- **Custom kategorie:** nazwy własne usera — NIE tłumaczone, wyświetlane jak wpisane.

## Fazy
1. **Fundament (~pół dnia):** i18next + expo-localization, detekcja + przełącznik w profilu, `pl.json`/`en.json` (szkielet).
2. **Ekstrakcja stringów (~1–2 dni):** ~50 plików, `"tekst"` → `t('key')`. Główny wolumen.
3. **AI backend (~pół dnia):** przekazać język do `parseItemsWithAI`; zlokalizować system prompt + listę kategorii; mapować etykietę→klucz; zwracać właściwy `language`.
4. **Kategorie (~pół–1 dzień):** wdrożyć `CATEGORY_DEFS`, przepiąć wyświetlanie/kolory/ikony, ujednolicić klient↔serwer.

## Poza kodem
- **Listing EN w Play Console** — osobna zlokalizowana strona sklepu (nie kod).

## Szacunek
~3–5 dni skupionej pracy.
