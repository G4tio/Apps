// Equivalente de multer para el navegador: lee los archivos de un FormData.
async function toFile(f) {
  return { buffer: Buffer.from(new Uint8Array(await f.arrayBuffer())), originalname: f.name, mimetype: f.type, size: f.size };
}
function multer({ limits } = {}) {
  const max = limits?.fileSize || Infinity;
  const check = (f) => { if (f.size > max) throw Object.assign(new Error('El archivo supera el tamaño máximo permitido.'), { status: 413 }); };
  return {
    single: (name) => async (req, res, next) => {
      const f = req._form?.get(name);
      if (f && typeof f === 'object' && 'arrayBuffer' in f) { check(f); req.file = await toFile(f); }
      next();
    },
    array: (name) => async (req, res, next) => {
      const list = (req._form?.getAll(name) || []).filter((f) => f && typeof f === 'object' && 'arrayBuffer' in f);
      req.files = [];
      for (const f of list) req.files.push(await toFile(f));
      next();
    },
  };
}
multer.memoryStorage = () => null;
export default multer;
