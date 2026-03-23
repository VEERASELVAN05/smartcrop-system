// Multiple free LibreTranslate servers for fallback
const SERVERS = [
  'https://libretranslate.com/translate',
  'https://translate.argosopentech.com/translate',
  'https://libretranslate.de/translate',
];

const LANG_CODES = {
  'English':   'en',
  'Tamil':     'ta',
  'Telugu':    'te',
  'Malayalam': 'ml',
  'Kannada':   'kn',
  'Hindi':     'hi',
};

// Try each server until one works
export const translateText = async (text, targetLang) => {
  if (targetLang === 'English' || !text) return text;
  const target = LANG_CODES[targetLang];
  if (!target) return text;

  // Check localStorage cache first
  const cacheKey = `tr_${targetLang}_${btoa(
    unescape(encodeURIComponent(text))
  ).slice(0, 20)}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  for (const server of SERVERS) {
    try {
      const res = await fetch(server, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target,
          format: 'text'
        }),
        signal: AbortSignal.timeout(5000)
      });
      const data = await res.json();
      if (data.translatedText) {
        localStorage.setItem(cacheKey, data.translatedText);
        return data.translatedText;
      }
    } catch { continue; }
  }
  return text; // fallback to English
};

// Translate entire object at once
export const translateObject = async (obj, targetLang) => {
  if (targetLang === 'English') return obj;

  const keys = Object.keys(obj);
  const values = Object.values(obj);

  const translated = await Promise.all(
    values.map(v =>
      typeof v === 'string'
        ? translateText(v, targetLang)
        : Promise.resolve(v)
    )
  );

  return Object.fromEntries(
    keys.map((k, i) => [k, translated[i]])
  );
};