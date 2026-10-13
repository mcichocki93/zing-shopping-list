// check-web-env.mjs — bramka przed buildem weba.
//
// Konfiguracja Firebase jest WYPALANA w bundlu w czasie builda (app.config.ts →
// extra → Constants.expoConfig.extra). `getEnvVar` w src/config/env.ts rzuca
// wyjątkiem przy braku zmiennej, co w przeglądarce objawia się białym ekranem
// bez sensownego komunikatu. Lepiej wywalić build tutaj, niż wypuścić obraz
// Dockera, który nie wstaje.

// Lokalnie konfiguracja siedzi w .env — app.config.ts robi to samo przez 'dotenv/config'.
// W Dockerze/CI zmienne są już w środowisku i dotenv po prostu nic nie znajduje.
import 'dotenv/config';

const REQUIRED = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
];

const missing = REQUIRED.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error('\n[check-web-env] Brak wymaganych zmiennych środowiskowych:\n');
  for (const key of missing) console.error(`  - ${key}`);
  console.error('\nLokalnie: skopiuj .env.example do .env i uzupełnij.');
  console.error('W Dockerze: przekaż je jako --build-arg (NIE jako -e przy docker run —');
  console.error('konfiguracja jest wypalana w czasie builda, w runtime nie ma czego czytać).\n');
  process.exit(1);
}

console.log('[check-web-env] wszystkie wymagane zmienne obecne');
