// Versión de navegador: un solo usuario (el dueño del dispositivo), sin inicio de sesión.
const LOCAL_USER = { id: 1, username: 'docente', display_name: 'Docente' };
export const parseCookies = () => ({});
export const createSession = () => 'local';
export const destroySession = () => {};
export const currentUser = () => LOCAL_USER;
export const requestToken = () => 'local';
export const userIdForToken = () => 1;
export function requireAuth(req, res, next) { req.user = LOCAL_USER; next(); }
export function loginRateLimit(req, res, next) { next(); }
