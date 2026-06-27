import { franc } from 'franc-min';

const LOCALE_MAP: Record<string, string> = {
  hin: 'hi',
  tam: 'ta',
  tel: 'te',
  kan: 'kn',
  eng: 'en',
  und: 'en',
};

export function detectLanguage(text: string): string {
  if (!text || text.trim().length < 10) return 'en';
  const iso639_3 = franc(text, { minLength: 10 });
  return LOCALE_MAP[iso639_3] ?? 'en';
}

export function getLanguageLabel(bcp47: string): string {
  const labels: Record<string, string> = {
    en: 'English',
    hi: 'हिंदी',
    ta: 'தமிழ்',
    te: 'తెలుగు',
    kn: 'ಕನ್ನಡ',
  };
  return labels[bcp47] ?? 'English';
}

export function getLanguageFlag(bcp47: string): string {
  const flags: Record<string, string> = {
    en: '🇬🇧',
    hi: '🇮🇳',
    ta: '🇮🇳',
    te: '🇮🇳',
    kn: '🇮🇳',
  };
  return flags[bcp47] ?? '🌐';
}
