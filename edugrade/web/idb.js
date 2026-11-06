// Almacenamiento persistente en el dispositivo (IndexedDB).
let dbp = null;
function open() {
  if (!dbp) {
    dbp = new Promise((resolve, reject) => {
      const req = indexedDB.open('edugrade-ai', 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore('kv');
        req.result.createObjectStore('files');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('No se pudo abrir el almacenamiento del navegador.'));
    });
  }
  return dbp;
}
function run(store, mode, fn) {
  return open().then((db) => new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const r = fn(t.objectStore(store));
    t.oncomplete = () => resolve(r?.result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error || new Error('Operación cancelada (¿almacenamiento lleno?).'));
  }));
}
export const idb = {
  get: (store, key) => run(store, 'readonly', (s) => s.get(key)),
  set: (store, key, value) => run(store, 'readwrite', (s) => s.put(value, key)),
  del: (store, key) => run(store, 'readwrite', (s) => s.delete(key)),
  keys: (store) => run(store, 'readonly', (s) => s.getAllKeys()),
};
