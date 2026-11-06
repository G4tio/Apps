// Configuración de la versión de navegador: las claves las escribe el docente en Ajustes
// y se guardan únicamente en este dispositivo.
import { getSetting } from './db.js';

export const config = {
  port: 0,
  publicUrl: typeof location !== 'undefined' ? location.origin : '',
  dataDir: '',
  cacheDir: '',
  secureCookies: false,
  browser: true,
  anthropic: {
    get apiKey() { return getSetting('ai.apiKey', ''); },
    get model() { return getSetting('ai.model', 'claude-opus-5-5'); },
    effort: 'high',
    fallbacks: true,
  },
  google: {
    get clientId() { return getSetting('google.clientId', ''); },
    clientSecret: '',
    redirectUri: '',
  },
  queue: { concurrency: 2, maxAttempts: 4 },
  maxPdfBytes: 30 * 1024 * 1024,
};

export function integrationStatus() {
  return {
    ai: { configured: Boolean(config.anthropic.apiKey), model: config.anthropic.model },
    drive: { configured: Boolean(config.google.clientId), redirectUri: '', origin: config.publicUrl },
    browser: true,
  };
}
