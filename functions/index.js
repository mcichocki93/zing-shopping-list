const {onCall, HttpsError} = require('firebase-functions/v2/https');
const {defineSecret} = require('firebase-functions/params');
const admin = require('firebase-admin');
const {GoogleGenerativeAI} = require('@google/generative-ai');

admin.initializeApp();

// Define secret for Gemini API key
const geminiApiKey = defineSecret('GEMINI_API_KEY');

const CATEGORIES = [
  'Owoce i warzywa',
  'Nabiał',
  'Pieczywo',
  'Mięso i wędliny',
  'Ryby',
  'Mrożonki',
  'Napoje',
  'Słodycze i przekąski',
  'Chemia domowa',
  'Higiena osobista',
  'Inne',
];

const SYSTEM_PROMPT = `Jesteś asystentem listy zakupów. Otrzymujesz tekst od użytkownika z produktami do kupienia.
Zwróć JSON array z obiektami, gdzie każdy obiekt to jeden produkt.

Każdy obiekt musi mieć:
- "name": string — nazwa produktu (po polsku, w mianowniku, bez ilości)
- "quantity": number — ilość (domyślnie 1)
- "unit": string | null — jednostka (np. "kg", "l", "szt", "opak") lub null
- "category": string — jedna z: ${CATEGORIES.join(', ')}

Zasady:
- Rozdzielaj produkty po przecinkach, "i", nowych liniach
- Jeśli użytkownik napisze "2 kg jabłek" → name: "Jabłka", quantity: 2, unit: "kg"
- Jeśli napisze "mleko" → name: "Mleko", quantity: 1, unit: null
- Używaj wielkich liter na początku nazwy
- Odpowiedz TYLKO poprawnym JSON array, bez markdown, bez komentarzy`;

// Server-side rate limit (abuse protection regardless of plan)
const userCallCounts = new Map();
const BURST_LIMIT = 10;
const BURST_WINDOW = 60 * 60 * 1000; // 1 hour

// Daily free tier limit (must match AI_FREE_DAILY_LIMIT in src/types/user.ts)
// TESTING: set to 10 — change back to 1 before release
const AI_FREE_DAILY_LIMIT = 10;

function checkBurstLimit(userId) {
  const now = Date.now();
  const entry = userCallCounts.get(userId);
  if (entry && entry.resetTime > now) {
    if (entry.count >= BURST_LIMIT) return false;
    entry.count++;
  } else {
    userCallCounts.set(userId, {count: 1, resetTime: now + BURST_WINDOW});
  }
  return true;
}

/**
 * Checks 24h quota for free users and increments the counter atomically.
 * Throws resource-exhausted if limit already used within last 24h.
 */
async function checkAndIncrementDailyQuota(userId) {
  const db = admin.firestore();
  const userRef = db.collection('users').doc(userId);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    if (!snap.exists) return; // new user — let it through

    const data = snap.data();
    if (data.isPremium === true) return; // no limit for premium users

    const now = new Date();
    const resetDate = data.aiUsageResetDate?.toDate?.() ?? new Date(0);

    // Reset date has passed — allow and set next reset to +24h
    if (now >= resetDate) {
      const nextReset = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      tx.update(userRef, {aiUsageThisMonth: 1, aiUsageResetDate: nextReset});
      return;
    }

    const usage = data.aiUsageThisMonth ?? 0;
    if (usage >= AI_FREE_DAILY_LIMIT) {
      const hoursLeft = Math.ceil((resetDate - now) / (1000 * 60 * 60));
      throw new HttpsError(
        'resource-exhausted',
        `Wykorzystałeś dzienny limit AI. Wróć za ${hoursLeft}h lub kup Premium.`,
      );
    }

    tx.update(userRef, {aiUsageThisMonth: admin.firestore.FieldValue.increment(1)});
  });
}

exports.parseItemsWithAI = onCall({secrets: [geminiApiKey]}, async (request) => {
  // 1. Verify authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Musisz być zalogowany, aby użyć AI.');
  }

  const userId = request.auth.uid;

  // 2. Burst rate limit (protects against rapid abuse)
  if (!checkBurstLimit(userId)) {
    throw new HttpsError('resource-exhausted', 'Za dużo żądań. Spróbuj za chwilę.');
  }

  // 3. Daily quota check + increment (free users only)
  await checkAndIncrementDailyQuota(userId);

  // 4. Validate input
  const {input} = request.data;
  if (!input || typeof input !== 'string') {
    throw new HttpsError('invalid-argument', 'Podaj produkty do dodania.');
  }

  const sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();

  if (!sanitized || sanitized.length === 0) {
    throw new HttpsError('invalid-argument', 'Podaj produkty do dodania.');
  }

  if (sanitized.length > 500) {
    throw new HttpsError('invalid-argument', `Tekst jest za długi (max 500 znaków).`);
  }

  try {
    // 4. Initialize Gemini AI with secret
    const genAI = new GoogleGenerativeAI(geminiApiKey.value());
    const model = genAI.getGenerativeModel({model: 'gemini-2.5-flash-lite'});

    // 5. Generate content
    const result = await model.generateContent(
      SYSTEM_PROMPT + '\n\nProdukty od użytkownika:\n' + sanitized,
    );

    const response = result.response;
    const text = response.text().trim();

    // 6. Parse JSON response
    const jsonText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      throw new HttpsError('internal', 'AI zwróciło nieprawidłową odpowiedź. Spróbuj ponownie.');
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new HttpsError('internal', 'Nie udało się rozpoznać produktów. Spróbuj inaczej.');
    }

    // 7. Sanitize items
    const items = parsed
      .map((raw) => {
        const name = typeof raw.name === 'string' ? raw.name.trim() : '';
        if (!name) return null;

        const quantity =
          typeof raw.quantity === 'number' && raw.quantity > 0 ? raw.quantity : 1;
        const unit =
          typeof raw.unit === 'string' && raw.unit.trim() ? raw.unit.trim() : undefined;

        const rawCategory = typeof raw.category === 'string' ? raw.category.trim() : 'Inne';
        const category = CATEGORIES.includes(rawCategory) ? rawCategory : 'Inne';

        return {
          name: name.slice(0, 100),
          quantity,
          unit: unit?.slice(0, 20),
          category,
          confidence: CATEGORIES.includes(rawCategory) ? 0.9 : 0.5,
        };
      })
      .filter((item) => item !== null);

    if (items.length === 0) {
      throw new HttpsError('internal', 'Nie udało się rozpoznać produktów. Spróbuj inaczej.');
    }

    // 8. Log usage for monitoring
    await admin
      .firestore()
      .collection('aiUsageLogs')
      .add({
        userId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        inputLength: sanitized.length,
        outputCount: items.length,
      });

    return {
      items,
      language: 'pl',
    };
  } catch (err) {
    if (err instanceof HttpsError) {
      throw err;
    }

    console.error('AI parsing error:', err);
    throw new HttpsError('internal', 'Błąd AI. Spróbuj ponownie.');
  }
});
