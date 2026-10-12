import en from '../locales/en.json' with { type: 'json' };
import zh from '../locales/zh.json' with { type: 'json' };
import ja from '../locales/ja.json' with { type: 'json' };

export const dictionaries = { en, zh, ja };
export const languageNames = { zh: '中文', en: 'EN', ja: '日本語' };
export function detectLanguage(locale = 'en') {
  const short = locale.toLowerCase().split(/[-_]/)[0];
  return Object.hasOwn(dictionaries, short) ? short : 'en';
}
export function translate(key, locale = 'en') {
  return dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? key;
}
export function initialLanguage() {
  try {
    const saved = localStorage.getItem('mindclone.language');
    if (Object.hasOwn(dictionaries, saved)) return saved;
  } catch { /* Private browser settings can disable storage. */ }
  return detectLanguage(navigator.language);
}
export function saveLanguage(locale) {
  try { localStorage.setItem('mindclone.language', locale); } catch { /* Optional preference only. */ }
}
