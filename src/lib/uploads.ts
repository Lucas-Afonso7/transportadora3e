// Regras de validação de comprovante compartilhadas entre a action de envio
// (Etapa 5) e, futuramente, qualquer outro lugar que precise reafirmar o
// mesmo limite (ex.: mensagem de erro no front).
export const MAX_PROOF_SIZE_BYTES = 8 * 1024 * 1024; // 8MB — cobre foto de celular e PDF de comprovante sem abrir espaço pra abuso.

export const ALLOWED_PROOF_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export function isAllowedProofMimeType(
  mimeType: string,
): mimeType is keyof typeof ALLOWED_PROOF_MIME_TYPES {
  return mimeType in ALLOWED_PROOF_MIME_TYPES;
}
