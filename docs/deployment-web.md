# Zing PWA — Deployment Guide

Wdrożenie wersji webowej (PWA) jako statycznego builda za nginx, w Dockerze, przez GitHub Actions.

> **Przeczytaj to najpierw.** W przeciwieństwie do backendów API, ta aplikacja **nie czyta konfiguracji w runtime**. Cała konfiguracja Firebase jest **wypalana w bundlu JavaScript w czasie builda**. `docker run -e FIREBASE_API_KEY=...` **nie zadziała** — w runtime nie ma czego czytać. Konfiguracja wchodzi przez `--build-arg`. Inne środowisko = inny obraz.

## Jak to działa

```
app.config.ts  →  extra: { firebaseApiKey: process.env.FIREBASE_API_KEY, ... }
                     ↓  (czas builda)
src/config/env.ts  →  Constants.expoConfig.extra  →  firebaseConfig
                     ↓
              bundle JS z wartościami w środku
```

`src/config/env.ts` **rzuca wyjątkiem** przy braku zmiennej, co w przeglądarce objawia się białym ekranem bez komunikatu. Dlatego `scripts/check-web-env.mjs` sprawdza je przed buildem i wywala go z czytelnym błędem, zamiast wypuścić zepsuty obraz.

### Zawartość obrazu

| | |
|---|---|
| Stage 1 (`node:22-alpine`) | `npm ci` → `npm run build:web` → `dist/` |
| Stage 2 (`nginx:1.27-alpine`) | `dist/` + `nginx.conf`, nasłuch na `:80` |
| Runtime | wyłącznie nginx — **zero Node.js** |

`npm run build:web` to trzy kroki: walidacja zmiennych → `expo export --platform web` → `scripts/finalize-web.mjs`, który wstrzykuje do `index.html` manifest, tagi iOS i rejestrację service workera (Expo tego nie generuje).

## Zmienne środowiskowe

### Wymagane

```bash
FIREBASE_API_KEY=AIza...
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef
```

### Opcjonalne

```bash
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX   # Google Analytics
```

### Czego tu NIE ma

- `GEMINI_API_KEY` — żyje wyłącznie w Secret Managerze po stronie Cloud Functions. **Nigdy** w kliencie.
- `GOOGLE_WEB_CLIENT_ID` — potrzebny tylko dla natywnego Google Sign-In (Android). Na webie logowanie social wymaga `signInWithPopup` (patrz Znane ograniczenia).

### Zmienne runtime kontenera

Te działają normalnie, bo czyta je Docker, a nie aplikacja:

```bash
ZING_IMAGE=ghcr.io/mcichocki93/zing-web:latest   # tag do uruchomienia
ZING_PORT=8087                                    # port na hoście
```

## Lokalne uruchomienie

```bash
cp .env.example .env     # uzupełnij wartościami z Firebase Console
npm install
npm run web              # dev server z hot reloadem
```

> **Windows/PowerShell:** jeśli `npx` zwraca `running scripts is disabled on this system`, użyj `npx.cmd` albo wykonaj raz `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

Build produkcyjny lokalnie:

```bash
npm run build:web        # → dist/
npx serve dist           # podejrzenie (dowolny statyczny serwer)
```

## Build Dockera lokalnie

```bash
docker build \
  --build-arg FIREBASE_API_KEY="$FIREBASE_API_KEY" \
  --build-arg FIREBASE_AUTH_DOMAIN="$FIREBASE_AUTH_DOMAIN" \
  --build-arg FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID" \
  --build-arg FIREBASE_STORAGE_BUCKET="$FIREBASE_STORAGE_BUCKET" \
  --build-arg FIREBASE_MESSAGING_SENDER_ID="$FIREBASE_MESSAGING_SENDER_ID" \
  --build-arg FIREBASE_APP_ID="$FIREBASE_APP_ID" \
  -t zing-web .

docker run --rm -p 8087:80 zing-web
```

Albo przez compose, który czyta `.env` sam:

```bash
docker compose build
docker compose up -d
```

## Wdrożenie przez GitHub Actions

Workflow: `.github/workflows/deploy-web.yml`. Odpala się na push do `main` (tylko gdy zmienią się pliki wpływające na weba) oraz ręcznie przez **Run workflow**.

```
push main → build obrazu → GHCR → ssh na VPS → docker compose pull/up → health check
```

Obraz dostaje dwa tagi: `latest` i `:<sha>`. Wdrożenie przypina **konkretny SHA**, więc rollback to zmiana jednej zmiennej.

### Sekrety w repozytorium

Settings → Secrets and variables → Actions:

| Sekret | Opis |
|---|---|
| `FIREBASE_API_KEY` | konfiguracja Firebase |
| `FIREBASE_AUTH_DOMAIN` | |
| `FIREBASE_PROJECT_ID` | |
| `FIREBASE_STORAGE_BUCKET` | |
| `FIREBASE_MESSAGING_SENDER_ID` | |
| `FIREBASE_APP_ID` | |
| `FIREBASE_MEASUREMENT_ID` | opcjonalny |
| `VPS_HOST` | adres serwera (IPv4, IPv6 lub nazwa) |
| `VPS_USER` | użytkownik SSH |
| `VPS_SSH_KEY` | **klucz prywatny** w całości, razem z nagłówkiem i stopką |
| `VPS_PATH` | katalog z `docker-compose.yml` na serwerze |
| `VPS_PORT` | port SSH, opcjonalny (domyślnie 22) |

Logowanie do GHCR idzie przez wbudowany `GITHUB_TOKEN` — nie trzeba zakładać osobnego PAT-a.

### Pierwsza konfiguracja VPS

```bash
# 1. klucz wdrożeniowy (na swojej maszynie)
ssh-keygen -t ed25519 -f ~/.ssh/zing-deploy -C "github-actions-zing"
ssh-copy-id -i ~/.ssh/zing-deploy.pub user@vps
# zawartość ~/.ssh/zing-deploy → sekret VPS_SSH_KEY

# 2. katalog i compose (na serwerze)
mkdir -p /opt/zing && cd /opt/zing
# skopiuj tu docker-compose.yml z repo
echo "ZING_PORT=8087" > .env
```

Na tym etapie **nie uruchamiaj** `docker compose up` — obraz jeszcze nie istnieje w GHCR. Pierwszy obraz powstaje przy pierwszym przejściu workflow. Weryfikuj po nim:

```bash
curl -f localhost:8087/health
```

TLS kończy się na reverse proxy przed kontenerem (Caddy, Traefik albo nginx hosta). Kontener mówi czystym HTTP na `:80` i **nie należy wystawiać go wprost do internetu** — PWA wymaga HTTPS, bo bez niego service worker się nie zarejestruje.

> **VPS z dzielonym IPv4** (np. Mikrus): masz przydzielony zakres portów, nie dowolny. Ustaw `ZING_PORT` na port ze swojego zakresu i wskaż go w reverse proxy.

### Rollback

```bash
cd /opt/zing
ZING_IMAGE=ghcr.io/mcichocki93/zing-web:POPRZEDNI_SHA docker compose up -d web
```

## Health check

| Endpoint | Zwraca |
|---|---|
| `GET /health` | `ok` — bez wpisu w logu dostępowym |

Kontener ma własny `HEALTHCHECK`, więc `docker inspect` zwraca status `healthy`/`unhealthy`. Workflow czeka na `healthy` do 30 s i w razie porażki wypisuje ostatnie 50 linii logu.

## Polityka cache — dlaczego tak

To najważniejsza część `nginx.conf` i najłatwiejsza do zepsucia:

| Ścieżka | Cache | Dlaczego |
|---|---|---|
| `/_expo/static/*` | rok, `immutable` | nazwy mają hash treści |
| `/icons/*` | tydzień | zmieniają się rzadko |
| `/manifest.webmanifest` | godzina | |
| `/index.html` | **no-store** | wskazuje na zahashowany bundle |
| `/sw.js` | **no-store** | |

`index.html` i `sw.js` **muszą** być nieskeszowane. Jeśli przeglądarka zapamięta stary service worker albo stary `index.html` wskazujący na bundle, którego już nie ma, użytkownik zostaje uwięziony w poprzedniej wersji i **żadne kolejne wdrożenie go nie odratuje**.

## Bezpieczeństwo

### Co jest, a co nie jest sekretem

Klucz przeglądarkowy Firebase **jest publiczny z założenia** — musi być w kliencie i da się go odczytać z bundla. To nie wyciek. Dostępu pilnują **reguły Firestore**, nie tajność klucza. Trzymamy go w sekretach Actions dla porządku, nie dla poufności.

Prawdziwe sekrety tego projektu żyją poza klientem: klucz Gemini i konto serwisowe Google Play są w Secret Managerze po stronie Cloud Functions.

### Reguły Firestore to jedyna linia obrony

Wystawienie weba zwiększa powierzchnię ataku — każdy może odpytywać projekt Firebase z przeglądarki. `firestore.rules` musi być wdrożone i aktualne:

```bash
firebase deploy --only firestore:rules
```

### Klucz hosta SSH

Workflow robi `ssh-keyscan` przy każdym wdrożeniu, czyli ufa hostowi przy pierwszym kontakcie (TOFU). Wygodne, ale teoretycznie podatne na MITM w sieci runnera. Mocniejszy wariant: zapisz wynik `ssh-keyscan` w sekrecie `VPS_KNOWN_HOSTS` i wpisuj go do `known_hosts` zamiast skanować.

### Klucz wdrożeniowy

Używaj **osobnego** klucza tylko do wdrożeń, nie swojego osobistego. Rozważ ograniczenie go w `~/.ssh/authorized_keys` na serwerze przez `command=` do samego skryptu wdrożeniowego.

## Znane ograniczenia wersji webowej

Rzeczy, które na Androidzie działają, a na webie nie — w kolejności istotności:

| Obszar | Stan | Uwagi |
|---|---|---|
| **Dane offline** | nie działa | Service worker keszuje powłokę aplikacji, ale Firestore nie ma włączonej trwałości w przeglądarce (`getFirestore` bez `persistentLocalCache`). Offline zobaczysz interfejs **bez danych**. To najpoważniejsza dziura dla listy zakupów — patrz Następne kroki. |
| **Zakup Premium** | nie działa | `expo-iap` to Play Billing, brak odpowiednika webowego. Darmowy użytkownik nie ma jak kupić Premium. Wymaga Stripe/Paddle. |
| **Google / Apple Sign-In** | nie działa | Moduły natywne. Logowanie **email + hasło działa** normalnie. Do zrobienia: `signInWithPopup` i `OAuthProvider('apple.com')`. |
| **Reklamy** | wyłączone | AdMob nie ma wersji webowej. `ads.web.ts` / `AdBanner.web.tsx` to świadome no-opy. |
| **Rozpoznawanie mowy** | niepewne | Web Speech API; na Safari iOS zawodne. |
| **Kolejność kategorii** | zamiennik | Przeciąganie blokowało scroll na webie, więc tam są strzałki góra/dół (`supportsDragList` w `src/utils/platform.ts`). |
| **Usuwanie przesunięciem** | działa | Potwierdzone w przeglądarce. |
| **Instalacja na iOS** | tarcie | Tylko Safari → Udostępnij → Dodaj do ekranu początkowego, bez promptu. iOS czyści dane po ~7 dniach nieużywania, jeśli PWA nie jest na ekranie początkowym. |

## Rozwiązywanie problemów

### Biały ekran po wdrożeniu

Prawie zawsze brak zmiennej środowiskowej. Sprawdź w logu builda, czy `check-web-env` przeszedł, i otwórz konsolę — `Missing environment variable: ...` wskazuje winowajcę.

### Użytkownik widzi starą wersję

Polityka cache dla `index.html` albo `sw.js`. Sprawdź nagłówki:

```bash
curl -sI https://twoja-domena/sw.js | grep -i cache-control
# oczekiwane: no-cache, no-store, must-revalidate
```

Jeśli przed kontenerem stoi CDN albo Cloudflare, może nadpisywać te nagłówki — wyłącz tam cache dla `/index.html` i `/sw.js`.

### Service worker się nie rejestruje

Wymaga **HTTPS** (wyjątek: `localhost`). Sprawdź w konsoli i w DevTools → Application → Service Workers.

### `docker compose pull` odbija 403

Logowanie do GHCR na serwerze wygasło albo paczka jest prywatna. Workflow loguje się przy każdym wdrożeniu; ręcznie przez `docker login ghcr.io` z osobistym tokenem.

### Bundle spuchł

Pilnuj importów barrelowych z paczek fontów i ikon. `@expo-google-fonts/inter` zaimportowany z korzenia wciąga **18 wag z kursywami (~6 MB)**; `@expo/vector-icons` z korzenia wciąga wszystkie rodziny (~4 MB). Zawsze importuj z podścieżek — patrz `src/fonts.ts`. Tą jedną zmianą `dist/` spadł z 15 MB do 7,1 MB.

## Następne kroki

1. **Włączyć trwałość Firestore na webie** — `persistentLocalCache` w `src/services/firebase/config.ts`. Bez tego PWA nie jest użyteczna offline, co dla listy zakupów jest podstawową funkcją. Wymaga przetestowania, czy nie koliduje z `arrayUnion`.
2. **Logowanie social na webie** — `signInWithPopup`.
3. **Premium na webie** — Stripe lub Paddle, wspólny flag `isPremium` w profilu użytkownika.
4. **Poprowadzić iOS przez instalację** — jednorazowa podpowiedź „Dodaj do ekranu początkowego" dla Safari.

## Checklista przed wdrożeniem produkcyjnym

- [ ] Wszystkie sekrety ustawione w GitHub Actions
- [ ] Reguły Firestore wdrożone (`firebase deploy --only firestore:rules`)
- [ ] Domena w **Firebase Console → Authentication → Authorized domains** (bez tego logowanie odbija)
- [ ] Reverse proxy z TLS przed kontenerem
- [ ] `curl https://domena/health` zwraca `ok`
- [ ] Nagłówki `Cache-Control` dla `/index.html` i `/sw.js` to `no-store`
- [ ] Manifest ładuje się i jest poprawny (DevTools → Application → Manifest)
- [ ] Service worker aktywny
- [ ] Zalogowanie i dodanie produktu działa na prawdziwej domenie
- [ ] Instalacja sprawdzona na Androidzie (Chrome) i iOS (Safari)
