// Genera dist/edugrade.html: EduGrade AI completo en un único archivo que funciona solo
// en el navegador (sin servidor). Reutiliza el mismo código de la API (src/) sustituyendo
// los módulos de Node.js por equivalentes para el navegador (web/).
// También copia el archivo a edugrade/index.html para publicarlo con GitHub Pages.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const safe = (js) => js.replace(/<\/script/gi, '<\\/script');

// Módulos de src/ que dependen de Node.js → versión de navegador en web/.
const SWAP = new Set(['db', 'config', 'auth', 'security', 'drive', 'retention', 'file-store', 'pdf']);
const swapPlugin = {
  name: 'edugrade-browser',
  setup(b) {
    b.onResolve({ filter: /^\.\.?\/.*\.js$/ }, (args) => {
      if (!args.importer.startsWith(path.join(root, 'src'))) return undefined;
      const name = path.basename(args.path, '.js');
      if (!SWAP.has(name)) return undefined;
      return { path: path.join(root, 'web', `${name}.js`) };
    });
    b.onResolve({ filter: /^(express|multer|exceljs)$/ }, (args) => ({ path: path.join(root, 'web/shims', `${args.path}.js`) }));
    b.onResolve({ filter: /^(node:)?(fs|path|crypto)$/ }, () => ({ path: path.join(root, 'web/shims/empty.js') }));
  },
};

const bundle = await build({
  entryPoints: [path.join(root, 'web/main.js')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  minify: true,
  write: false,
  target: ['es2020'],
  charset: 'utf8',
  legalComments: 'none',
  loader: { '.wasm': 'binary' },
  inject: [path.join(root, 'web/shims/buffer.js')],
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [swapPlugin],
  logLevel: 'warning',
});

const css = read('public/css/app.css');
const chart = read('node_modules/chart.js/dist/chart.umd.min.js');
const exceljs = read('node_modules/exceljs/dist/exceljs.min.js');
const logo = `data:image/svg+xml;base64,${Buffer.from(read('public/img/logo.svg')).toString('base64')}`;

let html = read('public/index.html');
html = html.replaceAll('/img/logo.svg', logo);
html = html.replace('<link rel="stylesheet" href="/css/app.css">', () => `<style>\n${css}\n</style>`);
html = html.replace('<script src="/vendor/chart.js/chart.umd.min.js"></script>', () =>
  `<script>${safe(chart)}</script>\n  <script>${safe(exceljs)}</script>`);
html = html.replace('<script type="module" src="/js/app.js"></script>', () =>
  `<script>window.EDUGRADE_LOGO=${JSON.stringify(logo)};</script>\n  <script>${safe(bundle.outputFiles[0].text)}</script>`);
html = html.replace('<html lang="es">', '<html lang="es">\n<!-- EduGrade AI — versión para navegador generada con «npm run build:html». No editar a mano. -->');

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/edugrade.html'), html);
fs.writeFileSync(path.join(root, 'index.html'), html);
console.log(`dist/edugrade.html e index.html generados (${(html.length / 1048576).toFixed(1)} MB)`);
