// EduGrade AI — servidor principal.
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { config, integrationStatus } from './src/config.js';
import { api } from './src/routes/api.js';
import { seedTemplates } from './src/rubrics.js';
import { startEngine } from './src/engine.js';
import { startRetentionJob } from './src/retention.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 'loopback');

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('Content-Security-Policy',
      "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'");
    next();
  });

  // CORS para el archivo HTML descargable (edugrade.html), que se autentica con un token
  // en la cabecera Authorization (nunca con cookies, por lo que no es vulnerable a CSRF).
  const allowed = (process.env.ALLOWED_ORIGINS || '*').split(',').map((s) => s.trim()).filter(Boolean);
  app.use('/api', (req, res, next) => {
    const origin = req.headers.origin;
    const cross = origin && (origin === 'null' || new URL(origin).host !== req.headers.host);
    if (cross && (allowed.includes('*') || allowed.includes(origin))) {
      res.setHeader('Access-Control-Allow-Origin', allowed.includes('*') ? '*' : origin);
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
      res.setHeader('Access-Control-Max-Age', '600');
      res.setHeader('Vary', 'Origin');
      if (req.method === 'OPTIONS') return res.status(204).end();
    }
    // Protección CSRF: una petición de otro origen que modifica datos solo se acepta con token explícito.
    if (cross && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const bearer = String(req.headers.authorization || '').startsWith('Bearer ');
      const isLogin = ['/auth/login', '/auth/setup'].includes(req.path);
      if (!(bearer || isLogin) || !(allowed.includes('*') || allowed.includes(origin))) {
        return res.status(403).json({ error: 'Origen no permitido.' });
      }
    }
    next();
  });

  app.use(express.json({ limit: '2mb' }));
  app.use('/api', api);
  app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

  app.use('/vendor/chart.js', express.static(path.join(__dirname, 'node_modules/chart.js/dist'), { maxAge: '7d' }));
  // Versión para navegador en un solo archivo HTML (funciona sin servidor).
  app.get('/edugrade.html', (req, res) => {
    const file = path.join(__dirname, 'dist/edugrade.html');
    if (!fs.existsSync(file)) return res.status(404).type('text').send('Ejecute «npm run build:html» para generar el archivo.');
    const html = fs.readFileSync(file);
    res.setHeader('Content-Disposition', 'attachment; filename="edugrade.html"');
    res.setHeader('Cache-Control', 'no-store');
    res.type('html').send(html);
  });

  app.use(express.static(path.join(__dirname, 'public'), { index: 'index.html' }));

  // Manejador de errores: mensajes claros para el docente, detalles solo en el registro.
  app.use((err, req, res, _next) => {
    const status = err.status || err.statusCode || (err.code === 'LIMIT_FILE_SIZE' ? 413 : err.response?.status === 404 ? 404 : 500);
    if (status >= 500) console.error('[error]', req.method, req.path, err);
    let message = err.message || 'Error interno.';
    if (err.code === 'LIMIT_FILE_SIZE') message = 'El archivo supera el tamaño máximo permitido.';
    if (err.response?.data?.error?.message) message = `Google: ${err.response.data.error.message}`;
    res.status(status >= 400 && status < 600 ? status : 500).json({ error: message });
  });
  return app;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedTemplates();
  startEngine();
  startRetentionJob();
  const app = createApp();
  app.listen(config.port, () => {
    const st = integrationStatus();
    console.log(`EduGrade AI escuchando en ${config.publicUrl}`);
    console.log(`  IA (Anthropic): ${st.ai.configured ? `configurada (${st.ai.model})` : 'NO configurada — defina ANTHROPIC_API_KEY'}`);
    console.log(`  Google Drive:   ${st.drive.configured ? `configurado (redirect ${st.drive.redirectUri})` : 'NO configurado — defina GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET'}`);
  });
}
