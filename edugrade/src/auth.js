// Autenticación de docentes: sesiones con cookie HttpOnly y token aleatorio
// (en la base de datos solo se guarda su hash).
import { db } from './db.js';
import { config } from './config.js';
import { randomToken, sha256 } from './security.js';

const COOKIE = 'edugrade_session';
const SESSION_DAYS = 7;

export function parseCookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function cookieAttrs(maxAgeSec) {
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${config.secureCookies ? '; Secure' : ''}`;
}

export function createSession(res, userId) {
  const token = randomToken();
  const expires = Date.now() + SESSION_DAYS * 86400_000;
  db.prepare('INSERT INTO sessions(token_hash, user_id, expires_at) VALUES(?,?,?)').run(sha256(token), userId, expires);
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; ${cookieAttrs(SESSION_DAYS * 86400)}`);
}

export function destroySession(req, res) {
  const token = parseCookies(req)[COOKIE];
  if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
  res.setHeader('Set-Cookie', `${COOKIE}=; ${cookieAttrs(0)}`);
}

export function currentUser(req) {
  const token = parseCookies(req)[COOKIE];
  if (!token) return null;
  const row = db.prepare(`SELECT u.id, u.username, u.display_name FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ?`).get(sha256(token), Date.now());
  return row || null;
}

export function requireAuth(req, res, next) {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Sesión no válida. Inicie sesión.' });
  req.user = user;
  next();
}

// Limitador simple de intentos de inicio de sesión por IP.
const attempts = new Map();
export function loginRateLimit(req, res, next) {
  const key = req.ip;
  const now = Date.now();
  const a = (attempts.get(key) || []).filter((t) => now - t < 15 * 60_000);
  if (a.length >= 10) return res.status(429).json({ error: 'Demasiados intentos. Espere unos minutos.' });
  a.push(now);
  attempts.set(key, a);
  next();
}
