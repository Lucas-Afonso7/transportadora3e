import "server-only";

import { randomUUID } from "crypto";
import { mkdir, writeFile, unlink, readFile } from "fs/promises";
import path from "path";

// Fora de `public/` de propósito: nada aqui é servido diretamente pelo
// Next.js. O único jeito de ler um comprovante é pela rota autenticada em
// /api/comprovantes/[id], que confere se quem pede é o dono do pagamento
// ou um admin antes de devolver o arquivo.
const STORAGE_ROOT = path.join(process.cwd(), "storage", "comprovantes");

// Nome do arquivo em disco é sempre gerado pelo servidor (UUID + extensão
// vinda do mapa de mime types validados) — o nome original enviado pelo
// cliente nunca chega a virar caminho de arquivo, o que elimina qualquer
// risco de path traversal via nome de arquivo malicioso.
export async function saveProofFile(
  buffer: Buffer,
  extension: string,
): Promise<string> {
  await mkdir(STORAGE_ROOT, { recursive: true });
  const fileName = `${randomUUID()}.${extension}`;
  await writeFile(path.join(STORAGE_ROOT, fileName), buffer);
  return fileName;
}

export async function deleteProofFile(fileName: string): Promise<void> {
  try {
    await unlink(path.join(STORAGE_ROOT, fileName));
  } catch (err) {
    // Best-effort: se a limpeza falhar, sobra um arquivo órfão inofensivo
    // (nenhuma linha no banco aponta pra ele) — não vale derrubar a
    // resposta ao usuário por causa disso.
    console.error("Falha ao remover arquivo órfão de comprovante:", fileName, err);
  }
}

export async function readProofFile(fileName: string): Promise<Buffer> {
  return readFile(path.join(STORAGE_ROOT, fileName));
}
