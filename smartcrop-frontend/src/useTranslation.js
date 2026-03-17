import { useState, useEffect } from 'react';
import { translateBatch } from './translateService';

const useTranslation = (defaultTexts) => {
  const [texts, setTexts] = useState(defaultTexts);
  const [loading, setLoading] = useState(false);
  const lang = localStorage.getItem('language') || 'English';

  useEffect(() => {
    if (lang === 'English') {
      setTexts(defaultTexts);
      return;
    }

    // Check if translation cached in localStorage
    const cacheKey = `translations_${lang}_${Object.keys(defaultTexts).join('_')}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      setTexts(JSON.parse(cached));
      return;
    }

    // Translate
    setLoading(true);
    translateBatch(defaultTexts, lang).then(translated => {
      setTexts(translated);
      // Cache for 24 hours
      localStorage.setItem(cacheKey, JSON.stringify(translated));
      setLoading(false);
    });
  }, [lang]);

  return { texts, loading };
};

export default useTranslation;