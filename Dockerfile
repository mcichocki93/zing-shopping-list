# Zing PWA — statyczny build za nginx.
#
# UWAGA: konfiguracja Firebase jest WYPALANA w bundlu JS w czasie builda
# (app.config.ts → extra → Constants.expoConfig.extra). Dlatego leci przez
# --build-arg, a nie przez -e przy `docker run`. Nie da się przestawić projektu
# Firebase na gotowym obrazie — inne środowisko = inny obraz.
#
# To nie jest wyciek sekretu: klucz przeglądarkowy Firebase jest publiczny
# z założenia i musi być w kliencie. Dostęp pilnują reguły Firestore i App
# Check, nie tajność klucza. Nigdy nie wkładaj tu klucza Gemini — ten żyje
# wyłącznie w Secret Managerze po stronie Cloud Functions.

# ─── build ──────────────────────────────────────────────────────────────────
# Debian, nie Alpine: metro.config.js wymaga react-native-svg-transformer,
# który jest devDependency — instalacja bez devDependencies zepsułaby import
# ikon .svg. A skoro devDependencies wchodzą, wchodzi też sharp, który na musl
# bywa kapryśny. Rozmiar tego stage'a nie ma znaczenia — do finalnego obrazu
# idzie wyłącznie dist/.
FROM node:22-bookworm-slim AS build

WORKDIR /app

# Warstwa zależności osobno — zmiana kodu nie unieważnia npm ci.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG FIREBASE_API_KEY
ARG FIREBASE_AUTH_DOMAIN
ARG FIREBASE_PROJECT_ID
ARG FIREBASE_STORAGE_BUCKET
ARG FIREBASE_MESSAGING_SENDER_ID
ARG FIREBASE_APP_ID
ARG FIREBASE_MEASUREMENT_ID

ENV FIREBASE_API_KEY=$FIREBASE_API_KEY \
    FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN \
    FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID \
    FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET \
    FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID \
    FIREBASE_APP_ID=$FIREBASE_APP_ID \
    FIREBASE_MEASUREMENT_ID=$FIREBASE_MEASUREMENT_ID \
    EXPO_NO_TELEMETRY=1

# check-web-env wywala build, jeśli brakuje zmiennej — zamiast wypuścić obraz,
# który wita użytkownika białym ekranem.
RUN npm run build:web

# ─── runtime ────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# interval=10s, bo Docker odpala PIERWSZĄ próbę dopiero po upływie interwału —
# przy 30s kontener przez pół minuty raportuje "starting", nie "healthy", co
# w CI wygląda jak awaria. -O /dev/null zamiast --spider, bo --spider nie jest
# obecny w każdym buildzie busyboxowego wgeta.
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/health || exit 1
