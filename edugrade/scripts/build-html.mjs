// Genera dist/edugrade.html: la interfaz completa de EduGrade AI en un único archivo
// (HTML + CSS + JavaScript + Chart.js + logo). El archivo se conecta al servidor de
// EduGrade AI con la dirección incluida (PUBLIC_URL o http://localhost:3000), sin pedirla al usuario.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const server = (process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, '').replace(/["\\<>]/g, '');
const safe = (js) => js.replace(/<\/script/gi, '<\\/script');

const bundle = await build({
  entryPoints: [path.join(pub, 'js/app.js')],
  bundle: true,
  format: 'iife',
  minify: true,
  write: false,
  target: ['es2020'],
  charset: 'utf8',
  legalComments: 'none',
});
const appJs = bundle.outputFiles[0].text;
const css = read('public/css/app.css');
const chart = read('node_modules/chart.js/dist/chart.umd.min.js');
const logo = `data:image/svg+xml;base64,${Buffer.from(read('public/img/logo.svg')).toString('base64')}`;

let html = read('public/index.html');
html = html.replaceAll('/img/logo.svg', logo);
html = html.replace('<link rel="stylesheet" href="/css/app.css">', () => `<style>\n${css}\n</style>`);
html = html.replace('<script src="/vendor/chart.js/chart.umd.min.js"></script>', () => `<script>${safe(chart)}</script>`);
html = html.replace('<script type="module" src="/js/app.js"></script>', () =>
  `<script>window.EDUGRADE_STANDALONE=true;window.EDUGRADE_SERVER=${JSON.stringify(server)};window.EDUGRADE_LOGO=${JSON.stringify(logo)};</script>\n  <script>${safe(appJs)}</script>`);
html = html.replace('<html lang="es">', '<html lang="es">\n<!-- EduGrade AI — archivo generado automáticamente con «npm run build:html». No editar a mano. -->');

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/edugrade.html'), html);
console.log(`dist/edugrade.html generado (${(html.length / 1024).toFixed(0)} KB) — servidor: ${server}`);
