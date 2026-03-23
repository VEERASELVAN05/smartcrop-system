import { useState, useEffect } from 'react';
import { translateObject } from './translateService';

const useTranslation = (defaultTexts, pageName) => {
  const lang = localStorage.getItem('language') || 'English';
  const cacheKey = `page_${pageName}_${lang}`;

  // Check if full page translation cached
  const getCached = () => {
    try {
      const cached = localStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  };

  const [texts, setTexts] = useState(
    getCached() || defaultTexts
  );
  const [loading, setLoading] = useState(
    lang !== 'English' && !getCached()
  );

  useEffect(() => {
    if (lang === 'English') {
      setTexts(defaultTexts);
      setLoading(false);
      return;
    }

    // Use cache if available
    const cached = getCached();
    if (cached) {
      setTexts(cached);
      setLoading(false);
      return;
    }

    // Translate all texts
    setLoading(true);
    translateObject(defaultTexts, lang).then(translated => {
      setTexts(translated);
      localStorage.setItem(
        cacheKey, JSON.stringify(translated)
      );
      setLoading(false);
    });
  }, [lang]);

  return { texts, loading, lang };
};

export default useTranslation;