// sw.js — service worker PWA Zing.
//
// Założenia:
//  1. Zasoby z /_expo/static/* mają hash w nazwie, więc są NIEZMIENNE —
//     cache-first jest bezpieczny i nie wymaga manifestu precache.
//  2. Nawigacje idą network-first z fallbackiem na cache: po wdrożeniu
//     użytkownik od razu dostaje nową wersję, a offline widzi powłokę aplikacji.
//  3. Żądań cross-origin NIE dotykamy. Firestore, Cloud Functions i Google Auth
//     muszą iść bezpośrednio do sieci — pośredniczenie w nich zepsułoby
//     nasłuch realtime i odświeżanie tokenów.
//
// Podbij CACHE_VERSION, gdy zmieni się strategia — stare cache zostaną usunięte.
const CACHE_VERSION = 'v1';
const CACHE = `zing-${CACHE_VERSION}`;
const APP_SHELL = '/index.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.add(new Request(APP_SHELL, { cache: 'reload' })))
      .catch(() => {/* brak sieci przy instalacji — powłoka dojdzie później */})
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Cokolwiek poza naszym originem (Firebase, Google, AdSense) — nie ruszamy.
  if (url.origin !== self.location.origin) return;

  // Nawigacja: network-first, offline → powłoka z cache.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(APP_SHELL, copy));
          return response;
        })
        .catch(() => caches.match(APP_SHELL).then((hit) => hit ?? Response.error())),
    );
    return;
  }

  // Zahashowane zasoby i ikony: cache-first.
  const isImmutable = url.pathname.startsWith('/_expo/static/')
    || url.pathname.startsWith('/icons/')
    || url.pathname.startsWith('/assets/');
  if (!isImmutable) return;

  event.respondWith(
    caches.match(request).then((hit) => {
      if (hit) return hit;
      return fetch(request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
