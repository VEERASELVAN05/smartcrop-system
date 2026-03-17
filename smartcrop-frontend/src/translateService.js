// LibreTranslate - Free and Open Source Translation API
const LIBRE_TRANSLATE_URL = 'https://libretranslate.com/translate';

const languageCodes = {
  'English':   'en',
  'Tamil':     'ta',
  'Telugu':    'te',
  'Malayalam': 'ml',
  'Kannada':   'kn',
  'Hindi':     'hi',
};

// Cache translations to avoid repeated API calls
const translationCache = {};

export const translateText = async (text, targetLanguage) => {
  // If English selected return original text
  if (targetLanguage === 'English') return text;

  const targetCode = languageCodes[targetLanguage];
  if (!targetCode) return text;

  // Check cache first
  const cacheKey = `${text}_${targetCode}`;
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  try {
    const response = await fetch(LIBRE_TRANSLATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: targetCode,
        format: 'text'
      })
    });

    const data = await response.json();
    const translated = data.translatedText || text;

    // Save to cache
    translationCache[cacheKey] = translated;
    return translated;

  } catch (error) {
    console.log('Translation failed, using English:', error);
    return text;
  }
};

// Translate multiple texts at once
export const translateBatch = async (textsObject, targetLanguage) => {
  if (targetLanguage === 'English') return textsObject;

  const keys = Object.keys(textsObject);
  const translated = { ...textsObject };

  // Translate all values
  await Promise.all(
    keys.map(async (key) => {
      if (typeof textsObject[key] === 'string') {
        translated[key] = await translateText(
          textsObject[key], targetLanguage
        );
      }
    })
  );

  return translated;
};