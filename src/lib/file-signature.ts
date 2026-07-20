// Detecta o tipo real do arquivo pelos primeiros bytes (magic bytes/file
// signature), em vez de confiar no `file.type` que o navegador reporta.
// `file.type` vem do cliente — fácil de falsificar (um .html renomeado
// pra "comprovante.png" com `type: "image/png"` passaria numa checagem
// que só olhasse esse campo). Aqui a decisão de "isso é mesmo uma
// imagem/PDF permitido" é baseada no que o arquivo É, não no que ele diz
// ser.
//
// Sem `server-only`: não usa nenhuma API exclusiva de servidor, só bytes
// — pode rodar em teste (vitest) sem restrição.
export type DetectedFileType = "image/jpeg" | "image/png" | "image/webp" | "application/pdf";

const JPEG_MAGIC = [0xff, 0xd8, 0xff];
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46]; // "%PDF"
// WEBP é um contêiner RIFF: "RIFF" nos bytes 0-3, tamanho nos bytes 4-7
// (ignorado aqui), "WEBP" nos bytes 8-11.
const RIFF_MAGIC = [0x52, 0x49, 0x46, 0x46];
const WEBP_MAGIC = [0x57, 0x45, 0x42, 0x50];

function matchesAt(buffer: Buffer, offset: number, magic: number[]): boolean {
  return magic.every((byte, i) => buffer[offset + i] === byte);
}

export function detectFileSignature(buffer: Buffer): DetectedFileType | null {
  if (matchesAt(buffer, 0, JPEG_MAGIC)) return "image/jpeg";
  if (matchesAt(buffer, 0, PNG_MAGIC)) return "image/png";
  if (matchesAt(buffer, 0, PDF_MAGIC)) return "application/pdf";
  if (matchesAt(buffer, 0, RIFF_MAGIC) && matchesAt(buffer, 8, WEBP_MAGIC)) {
    return "image/webp";
  }

  return null;
}
