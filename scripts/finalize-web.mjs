// finalize-web.mjs — dopina PWA do wyniku `expo export --platform web`.
//
// Expo generuje index.html bez manifestu, tagów iOS i rejestracji service
// workera. Zamiast podmieniać szablon Expo (nieudokumentowany i zmienia się
// między wersjami SDK) wstrzykujemy to po exporcie — deterministycznie
// i widocznie w diffie.
//
// Pliki statyczne (manifest, ikony, sw.js) Expo kopiuje samo z public/.

import { readFile, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = process.argv[2] ?? 'dist';
const INDEX = join(DIST, 'index.html');
const MARKER = '<!-- zing:pwa -->';

const HEAD = `${MARKER}
    <link rel="manifest" href="/manifest.webmanifest" />
    <meta name="theme-color" content="#FFF8EE" />
    <meta name="description" content="Współdzielone listy zakupów z rozpoznawaniem produktów przez AI." />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Zing" />
    <meta name="mobile-web-app-capable" content="yes" />`;

// Rejestrację odpalamy po 'load', żeby nie konkurowała o pasmo z bundlem.
const BODY = `    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
          navigator.serviceWorker.register('/sw.js').catch(function (err) {
            console.warn('[pwa] rejestracja service workera nie powiodła się:', err);
          });
        });
      }
    </script>`;

async function main() {
  try {
    await access(INDEX);
  } catch {
    console.error(`[finalize-web] brak ${INDEX} — uruchom najpierw \`expo export --platform web\``);
    process.exit(1);
  }

  let html = await readFile(INDEX, 'utf8');

  if (html.includes(MARKER)) {
    console.log('[finalize-web] index.html już przygotowany, pomijam');
    return;
  }

  // viewport-fit=cover — żeby standalone na iPhone'ach z notchem sięgał krawędzi
  html = html.replace(
    'content="width=device-width, initial-scale=1, shrink-to-fit=no"',
    'content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"',
  );

  if (!html.includes('</head>') || !html.includes('</body>')) {
    console.error('[finalize-web] nieoczekiwany kształt index.html — przerywam zamiast psuć plik');
    process.exit(1);
  }

  html = html.replace('</head>', `${HEAD}\n  </head>`);
  html = html.replace('</body>', `${BODY}\n</body>`);

  await writeFile(INDEX, html);
  console.log('[finalize-web] manifest, tagi iOS i rejestracja SW wstrzyknięte');
}

main();
