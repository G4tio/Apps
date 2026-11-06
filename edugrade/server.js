// EduGrade AI — servidor principal.
import express from 'express';
import path from 'node:path';
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

  // Protección CSRF: las peticiones que modifican datos deben venir del mismo origen.
  app.use('/api', (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const origin = req.headers.origin;
    if (origin && new URL(origin).host !== req.headers.host) return res.status(403).json({ error: 'Origen no permitido.' });
    next();
  });

  app.use(express.json({ limit: '2mb' }));
  app.use('/api', api);
  app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

  app.use('/vendor/chart.js', express.static(path.join(__dirname, 'node_modules/chart.js/dist'), { maxAge: '7d' }));
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
