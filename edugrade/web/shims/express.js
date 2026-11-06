// Mínimo compatible con express.Router() para ejecutar las rutas de la API en el navegador.
function compile(path) {
  const keys = [];
  const re = path.replace(/\/:([A-Za-z_]+)/g, (_, k) => { keys.push(k); return '/([^/]+)'; });
  return { re: new RegExp(`^${re}$`), keys };
}

function Router() {
  const stack = [];
  const add = (method) => (path, ...fns) => { stack.push({ method, path, fns, ...compile(path) }); return router; };
  const router = {
    stack,
    get: add('GET'), post: add('POST'), put: add('PUT'), patch: add('PATCH'), delete: add('DELETE'),
    use(...args) {
      if (typeof args[0] === 'string') stack.push({ method: 'USE', prefix: args[0], fns: args.slice(1) });
      else stack.push({ method: 'USE', prefix: '', fns: args });
      return router;
    },
  };
  return router;
}

const express = { Router, json: () => (req, res, next) => next() };
export default express;
