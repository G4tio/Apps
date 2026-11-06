// Revisión rápida del PDF en el navegador. La lectura completa (texto, imágenes, OCR)
// la hace el modelo de IA, que también informa si el documento está vacío o ilegible.
export class PdfProblem extends Error {
  constructor(type, message) {
    super(message);
    this.type = type;
  }
}

export async function inspectPdf(buffer) {
  if (!buffer || buffer.length === 0) throw new PdfProblem('documento_vacio', 'El archivo está vacío (0 bytes).');
  const text = new TextDecoder('latin1').decode(buffer.subarray(0, Math.min(buffer.length, 8 * 1024 * 1024)));
  if (!text.slice(0, 1024).includes('%PDF-')) throw new PdfProblem('archivo_danado', 'El archivo no tiene una cabecera PDF válida.');
  if (!/%%EOF/.test(new TextDecoder('latin1').decode(buffer.subarray(Math.max(0, buffer.length - 16384))))) {
    throw new PdfProblem('archivo_danado', 'El PDF está incompleto o dañado (falta el final del archivo).');
  }
  const pages = (text.match(/\/Type\s*\/Page(?!s)/g) || []).length || null;
  const hasImages = /\/Subtype\s*\/Image/.test(text);
  const hasFonts = /\/Font\b/.test(text);
  return { pages: pages || 1, textChars: null, imagePages: null, likelyScanned: hasImages && !hasFonts, pageTexts: [] };
}
