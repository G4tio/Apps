// Configuración central: todas las credenciales se leen del entorno del servidor,
// nunca se envían al navegador.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const dataDir = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), 'data'));
fs.mkdirSync(dataDir, { recursive: true });

function loadSecret() {
  if (process.env.APP_SECRET && process.env.APP_SECRET.length >= 32) return process.env.APP_SECRET;
  const file = path.join(dataDir, '.app_secret');
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8').trim();
  const s = crypto.randomBytes(48).toString('hex');
  fs.writeFileSync(file, s, { mode: 0o600 });
  return s;
}

const port = Number(process.env.PORT || 3000);
const publicUrl = (process.env.PUBLIC_URL || `http://localhost:${port}`).replace(/\/$/, '');

export const config = {
  port,
  publicUrl,
  dataDir,
  cacheDir: path.join(dataDir, 'cache'),
  appSecret: loadSecret(),
  secureCookies: publicUrl.startsWith('https://'),
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.ANTHROPIC_MODEL || 'claude-opus-5-5',
    effort: process.env.ANTHROPIC_EFFORT || 'high',
    // Reenvío automático a otro modelo si el principal declina la solicitud (recomendado).
    fallbacks: process.env.ANTHROPIC_FALLBACKS !== 'off',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || `${publicUrl}/api/drive/oauth/callback`,
  },
  queue: {
    concurrency: Math.max(1, Number(process.env.EVAL_CONCURRENCY || 2)),
    maxAttempts: Math.max(1, Number(process.env.EVAL_MAX_ATTEMPTS || 4)),
  },
  maxPdfBytes: 30 * 1024 * 1024,
};
fs.mkdirSync(config.cacheDir, { recursive: true });

export function integrationStatus() {
  return {
    ai: { configured: Boolean(config.anthropic.apiKey), model: config.anthropic.model },
    drive: { configured: Boolean(config.google.clientId && config.google.clientSecret), redirectUri: config.google.redirectUri },
  };
}
