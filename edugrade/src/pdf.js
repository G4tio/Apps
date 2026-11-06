// Inspección previa de PDF con PDF.js: valida integridad, cuenta páginas, extrae texto
// y detecta si las páginas contienen imágenes (documentos escaneados / manuscritos).
// El reconocimiento óptico (OCR) de páginas escaneadas lo realiza el modelo multimodal,
// que recibe cada página como imagen además del texto extraído.
import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs';

const IMAGE_OPS = new Set([OPS.paintImageXObject, OPS.paintInlineImageXObject, OPS.paintImageMaskXObject, OPS.paintImageXObjectRepeat].filter(Boolean));
const MAX_PAGES_TO_SCAN = 60;

export class PdfProblem extends Error {
  constructor(type, message) {
    super(message);
    this.type = type; // 'archivo_danado' | 'documento_vacio' | 'pdf_ilegible'
  }
}

export async function inspectPdf(buffer) {
  if (!buffer || buffer.length === 0) throw new PdfProblem('documento_vacio', 'El archivo está vacío (0 bytes).');
  const head = buffer.subarray(0, 1024).toString('latin1');
  if (!head.includes('%PDF-')) throw new PdfProblem('archivo_danado', 'El archivo no tiene una cabecera PDF válida.');

  let doc;
  let task;
  try {
    task = getDocument({
      data: new Uint8Array(buffer),
      isEvalSupported: false,
      useSystemFonts: false,
      disableFontFace: true,
      verbosity: 0,
    });
    doc = await task.promise;
  } catch (e) {
    if (e?.name === 'PasswordException') throw new PdfProblem('pdf_ilegible', 'El PDF está protegido con contraseña.');
    throw new PdfProblem('archivo_danado', `No se pudo abrir el PDF: ${e?.message || e}`);
  }

  try {
    const pages = doc.numPages;
    if (!pages) throw new PdfProblem('documento_vacio', 'El PDF no contiene páginas.');
    let textChars = 0;
    let imagePages = 0;
    const pageTexts = [];
    for (let p = 1; p <= Math.min(pages, MAX_PAGES_TO_SCAN); p++) {
      const page = await doc.getPage(p);
      let text = '';
      try {
        const content = await page.getTextContent();
        text = content.items.map((i) => i.str || '').join(' ').replace(/\s+/g, ' ').trim();
      } catch { /* página sin capa de texto */ }
      let hasImage = false;
      try {
        const ops = await page.getOperatorList();
        hasImage = ops.fnArray.some((fn) => IMAGE_OPS.has(fn));
      } catch { /* ignorar */ }
      if (hasImage) imagePages++;
      textChars += text.length;
      pageTexts.push(text);
      page.cleanup();
    }
    const scanned = pages > MAX_PAGES_TO_SCAN ? null : imagePages;
    if (textChars === 0 && imagePages === 0 && pages <= MAX_PAGES_TO_SCAN) {
      throw new PdfProblem('documento_vacio', 'El PDF no contiene texto ni imágenes (páginas en blanco).');
    }
    return {
      pages,
      textChars,
      imagePages: scanned,
      likelyScanned: textChars < 40 * Math.min(pages, MAX_PAGES_TO_SCAN) && imagePages > 0,
      pageTexts,
    };
  } finally {
    await task.destroy();
  }
}
