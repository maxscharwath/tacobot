/**
 * i18n configuration for backend
 * @module lib/i18n
 */

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';

const localesPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'locales', '{{lng}}.json');

const supportedLngs: readonly string[] = ['en', 'fr', 'de'];

// Initialize i18next and ensure all resources are loaded
// Using initImmediate: true ensures resources are loaded before the server starts
i18next.use(Backend).init({
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: [...supportedLngs],
  defaultNS: 'notifications',
  ns: ['notifications'],
  backend: { loadPath: localesPath },
  interpolation: { escapeValue: false },
  initImmediate: true,
  preload: [...supportedLngs],
});

export function t(key: string, options?: { lng?: string; [key: string]: unknown }): string {
  const lang = options?.lng?.toLowerCase() ?? 'en';
  const validLang = supportedLngs.includes(lang) ? lang : 'en';
  return i18next.getFixedT(validLang, 'notifications')(key, options);
}
