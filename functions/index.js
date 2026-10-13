const {onCall, HttpsError} = require('firebase-functions/v2/https');
const {onSchedule} = require('firebase-functions/v2/scheduler');
const {defineSecret} = require('firebase-functions/params');
const admin = require('firebase-admin');
const {GoogleGenerativeAI} = require('@google/generative-ai');
const {google} = require('googleapis');

admin.initializeApp();

// Define secrets
const geminiApiKey = defineSecret('GEMINI_API_KEY');
const googlePlayServiceAccountKey = defineSecret('GOOGLE_PLAY_SERVICE_ACCOUNT_KEY');

// Canonical category keys are Polish strings (stored in item data — Option A).
// English labels are used only when the client sends language 'en'; the AI then
// returns an English label which we map back to the canonical Polish key.
// Must stay in sync with the client's CATEGORIES (src/constants/index.ts) —
// the picker only offers these, so anything else the AI invents ends up as a
// category the user cannot pick again when editing the item.
const CATEGORY_DEFS = [
  {key: 'Owoce i warzywa', en: 'Fruits & veg'},
  {key: 'Nabiał', en: 'Dairy'},
  {key: 'Mięso i ryby', en: 'Meat & fish'},
  {key: 'Pieczywo', en: 'Bakery'},
  {key: 'Napoje', en: 'Drinks'},
  {key: 'Przekąski', en: 'Snacks'},
  {key: 'Mrożonki', en: 'Frozen'},
  {key: 'Chemia', en: 'Household'},
  {key: 'Inne', en: 'Other'},
];

// Categories this function used to return before it was aligned with the client.
// Existing item data still holds them, and the AI may echo one back, so fold
// them into the current keys instead of dropping the item into 'Inne'.
const LEGACY_CATEGORY_ALIASES = {
  'mięso i wędliny': 'Mięso i ryby',
  'meat & deli': 'Mięso i ryby',
  'ryby': 'Mięso i ryby',
  'fish': 'Mięso i ryby',
  'słodycze i przekąski': 'Przekąski',
  'sweets & snacks': 'Przekąski',
  'chemia domowa': 'Chemia',
  'higiena osobista': 'Chemia',
  'personal care': 'Chemia',
};

const CATEGORIES = CATEGORY_DEFS.map((d) => d.key);

// Map a category returned by the AI (Polish key OR English label OR a custom
// name) back to the canonical stored key. Falls back to 'Inne'.
function toCategoryKey(raw, userCategories) {
  if (!raw) return 'Inne';
  const lower = raw.toLowerCase();
  const def = CATEGORY_DEFS.find(
    (d) => d.key.toLowerCase() === lower || d.en.toLowerCase() === lower,
  );
  if (def) return def.key;
  const legacy = LEGACY_CATEGORY_ALIASES[lower];
  if (legacy) return legacy;
  const custom = userCategories.find((c) => c.toLowerCase() === lower);
  if (custom) return custom;
  return 'Inne';
}

// Canonical unit keys mirror the client's UNITS constant — Polish strings, the
// same Option A rule as categories. In English mode the AI answers with "pcs" /
// "pack", so map the answer back before storing; otherwise a PL user opening a
// shared list would see "pcs" where the picker writes "szt".
const UNIT_DEFS = [
  {key: 'szt', aliases: ['szt', 'szt.', 'sztuka', 'sztuki', 'sztuk', 'pcs', 'pc', 'pcs.', 'piece', 'pieces', 'item', 'items']},
  {key: 'opak', aliases: ['opak', 'opak.', 'opakowanie', 'pack', 'packs', 'package', 'packet', 'pkg']},
  {key: 'kg', aliases: ['kg', 'kilo', 'kilogram', 'kilograms', 'kilogramy']},
  {key: 'g', aliases: ['g', 'gr', 'gram', 'grams', 'gramy']},
  {key: 'dag', aliases: ['dag', 'deka', 'dekagram', 'dekagramy']},
  {key: 'l', aliases: ['l', 'litr', 'litry', 'litrow', 'liter', 'liters', 'litre', 'litres']},
  {key: 'ml', aliases: ['ml', 'mililitr', 'mililitry', 'milliliter', 'milliliters', 'millilitre']},
  {key: 'm', aliases: ['m', 'metr', 'metry', 'meter', 'meters', 'metre']},
  {key: 'cm', aliases: ['cm', 'centymetr', 'centymetry', 'centimeter', 'centimeters', 'centimetre']},
];

const UNIT_ALIASES = new Map();
for (const def of UNIT_DEFS) {
  for (const alias of def.aliases) UNIT_ALIASES.set(alias, def.key);
}

// Map a unit returned by the AI back to the canonical stored key. Unknown units
// are kept verbatim (trimmed) rather than dropped — the UI falls back to them.
function toUnitKey(raw) {
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  return UNIT_ALIASES.get(trimmed.toLowerCase()) ?? trimmed.slice(0, 20);
}

// Localized system prompt. `categories` = comma-joined labels the AI chooses from.
function buildSystemPrompt(language, categories) {
  if (language === 'en') {
    return `You are a shopping list assistant. You receive text from the user with products to buy.
Return a JSON array of objects, where each object is one product.

Each object must have:
- "name": string — product name (in English, singular, without quantity)
- "quantity": number — quantity (default 1)
- "unit": string | null — unit (e.g. "kg", "l", "pcs", "pack") or null
- "category": string — one of: ${categories}

Rules:
- Split products by commas, "and", new lines
- If the user writes "2 kg apples" → name: "Apples", quantity: 2, unit: "kg"
- If they write "milk" → name: "Milk", quantity: 1, unit: null
- Capitalize the first letter of the name
- Reply with ONLY a valid JSON array, no markdown, no comments`;
  }
  return `Jesteś asystentem listy zakupów. Otrzymujesz tekst od użytkownika z produktami do kupienia.
Zwróć JSON array z obiektami, gdzie każdy obiekt to jeden produkt.

Każdy obiekt musi mieć:
- "name": string — nazwa produktu (po polsku, w mianowniku, bez ilości)
- "quantity": number — ilość (domyślnie 1)
- "unit": string | null — jednostka (np. "kg", "l", "szt", "opak") lub null
- "category": string — jedna z: ${categories}

Zasady:
- Rozdzielaj produkty po przecinkach, "i", nowych liniach
- Jeśli użytkownik napisze "2 kg jabłek" → name: "Jabłka", quantity: 2, unit: "kg"
- Jeśli napisze "mleko" → name: "Mleko", quantity: 1, unit: null
- Używaj wielkich liter na początku nazwy
- Odpowiedz TYLKO poprawnym JSON array, bez markdown, bez komentarzy`;
}

// Server-side rate limit (abuse protection). AI is Premium-only, so this is a
// light guard against a single premium account hammering the endpoint.
const userCallCounts = new Map();
const BURST_LIMIT = 20;
const BURST_WINDOW = 60 * 60 * 1000; // 1 hour

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
 * Ensures the caller has an active Premium subscription. AI is a Premium-only
 * feature — free users have no AI access at all. Premium status is managed
 * exclusively by Cloud Functions (verifyAndGrantPremium / checkExpiredSubscriptions)
 * and locked down by Firestore rules, so it cannot be spoofed from the client.
 */
async function requirePremium(userId) {
  const db = admin.firestore();
  const snap = await db.collection('users').doc(userId).get();
  const data = snap.exists ? snap.data() : null;

  const expiry = data?.premiumExpiresAt?.toDate?.() ?? null;
  const active = data?.isPremium === true && (!expiry || expiry > new Date());

  if (!active) {
    throw new HttpsError(
      'permission-denied',
      'AI jest dostępne tylko w Zing Premium. Kup subskrypcję, aby korzystać z rozpoznawania produktów.',
    );
  }
}

/**
 * Deletes all user data from Firestore and removes the Firebase Auth account.
 * Called from the app when a user chooses to delete their account.
 */
exports.deleteUserAccount = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Musisz być zalogowany.');
  }

  const uid = request.auth.uid;
  const db = admin.firestore();

  // 1. Delete all shopping lists owned by this user
  const ownedLists = await db.collection('shoppingLists')
    .where('ownerId', '==', uid)
    .get();

  if (!ownedLists.empty) {
    const batch = db.batch();
    ownedLists.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  // 2. Remove user from lists they're a member of (but don't own)
  const sharedLists = await db.collection('shoppingLists')
    .where('memberIds', 'array-contains', uid)
    .get();

  if (!sharedLists.empty) {
    const batch = db.batch();
    sharedLists.docs.forEach((doc) => {
      const memberIds = doc.data().memberIds.filter((id) => id !== uid);
      batch.update(doc.ref, {
        memberIds,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();
  }

  // 3. Delete invite codes created by this user
  const invites = await db.collection('invites')
    .where('ownerId', '==', uid)
    .get();

  if (!invites.empty) {
    const batch = db.batch();
    invites.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  // 4. Delete AI usage logs
  const logs = await db.collection('aiUsageLogs')
    .where('userId', '==', uid)
    .get();

  if (!logs.empty) {
    const batch = db.batch();
    logs.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  // 5. Delete user document
  await db.collection('users').doc(uid).delete();

  // 6. Delete Firebase Auth account
  await admin.auth().deleteUser(uid);

  return {success: true};
});

/**
 * Verifies a Google Play purchase token server-side and grants premium if valid.
 * Called from the app after a successful Play Billing purchase.
 */
exports.verifyAndGrantPremium = onCall(
  {secrets: [googlePlayServiceAccountKey]},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Musisz być zalogowany.');
    }

    // Dev bypass — allow __DEV__ testing without a real purchase token
    if (request.data && request.data.devGrant === true) {
      if (process.env.FUNCTIONS_EMULATOR !== 'true') {
        throw new HttpsError('permission-denied', 'Dev grant tylko w emulatorze.');
      }
      const db = admin.firestore();
      await db.collection('users').doc(request.auth.uid).update({
        isPremium: true,
        premiumExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      return {success: true};
    }

    const {purchaseToken, packageName} = request.data;
    if (!purchaseToken || typeof purchaseToken !== 'string') {
      throw new HttpsError('invalid-argument', 'Brak tokenu zakupu.');
    }
    if (!packageName || typeof packageName !== 'string') {
      throw new HttpsError('invalid-argument', 'Brak nazwy pakietu.');
    }

    // Parse service account key from secret
    let serviceAccountKey;
    try {
      serviceAccountKey = JSON.parse(googlePlayServiceAccountKey.value());
    } catch {
      throw new HttpsError('internal', 'Błąd konfiguracji serwera.');
    }

    // Call Google Play Developer API
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });
    const androidPublisher = google.androidpublisher({version: 'v3', auth});

    let purchase;
    try {
      const result = await androidPublisher.purchases.subscriptions.get({
        packageName,
        subscriptionId: 'zing_premium_monthly',
        token: purchaseToken,
      });
      purchase = result.data;
    } catch {
      throw new HttpsError('failed-precondition', 'Nie udało się zweryfikować zakupu.');
    }

    // Validate: paymentState 1 = received, subscription not expired
    const paymentState = purchase.paymentState;
    const expiryMs = parseInt(purchase.expiryTimeMillis ?? '0', 10);
    const isValid = paymentState === 1 && expiryMs > Date.now();

    if (!isValid) {
      throw new HttpsError('failed-precondition', 'Zakup nieważny lub wygasły.');
    }

    // Update Firestore
    const db = admin.firestore();
    await db.collection('users').doc(request.auth.uid).update({
      isPremium: true,
      premiumExpiresAt: new Date(expiryMs),
      subscriptionToken: purchaseToken,
    });

    return {success: true, expiresAt: expiryMs};
  },
);

/**
 * Runs daily and revokes premium for users whose subscription has expired.
 * Handles cancellations and non-renewals automatically.
 */
exports.checkExpiredSubscriptions = onSchedule('every 24 hours', async () => {
  const db = admin.firestore();
  const now = admin.firestore.Timestamp.now();

  const expired = await db.collection('users')
    .where('isPremium', '==', true)
    .where('premiumExpiresAt', '<', now)
    .get();

  if (expired.empty) return;

  const batch = db.batch();
  expired.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, {isPremium: false});
  });
  await batch.commit();
});

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

  // 3. AI is Premium-only — reject free users
  await requirePremium(userId);

  // 4. Validate input
  const {input, customCategories: rawCustomCategories} = request.data;
  if (!input || typeof input !== 'string') {
    throw new HttpsError('invalid-argument', 'Podaj produkty do dodania.');
  }

  // Language — backward compatible: old clients don't send it → Polish.
  const language = request.data.language === 'en' ? 'en' : 'pl';

  // Build merged category list (built-in + user custom)
  const userCategories = Array.isArray(rawCustomCategories)
    ? rawCustomCategories
        .filter((c) => c && typeof c.name === 'string' && c.name.trim())
        .map((c) => c.name.trim().slice(0, 30))
    : [];
  // Labels shown to the AI in the requested language (custom categories as-is).
  const builtinLabels = language === 'en' ? CATEGORY_DEFS.map((d) => d.en) : CATEGORIES;
  const promptCategories = [...builtinLabels, ...userCategories];

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

    // 5. Generate content with the localized prompt + category list
    const systemPrompt = buildSystemPrompt(language, promptCategories.join(', '));
    const userLabel = language === 'en'
      ? '\n\nProducts from the user:\n'
      : '\n\nProdukty od użytkownika:\n';
    const result = await model.generateContent(systemPrompt + userLabel + sanitized);

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
        const unit = toUnitKey(raw.unit);

        const rawCategory = typeof raw.category === 'string' ? raw.category.trim() : '';
        const category = toCategoryKey(rawCategory, userCategories);
        const known = category !== 'Inne' || /^(inne|other)$/i.test(rawCategory);

        return {
          name: name.slice(0, 100),
          quantity,
          unit,
          category,
          confidence: known ? 0.9 : 0.5,
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
      language,
    };
  } catch (err) {
    if (err instanceof HttpsError) {
      throw err;
    }

    console.error('AI parsing error:', err);
    throw new HttpsError('internal', 'Błąd AI. Spróbuj ponownie.');
  }
});
