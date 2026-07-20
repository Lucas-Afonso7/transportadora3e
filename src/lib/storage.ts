import "server-only";

import { randomUUID } from "crypto";
import { mkdir, writeFile, unlink, readFile } from "fs/promises";
import path from "path";
import { del, get, put } from "@vercel/blob";

// Fora de `public/` de propósito: nada aqui é servido diretamente pelo
// Next.js. O único jeito de ler um comprovante é pela rota autenticada em
// /api/comprovantes/[id], que confere se quem pede é o dono do pagamento
// ou um admin antes de devolver o arquivo.
const STORAGE_ROOT = path.join(process.cwd(), "storage", "comprovantes");
const BLOB_PREFIX = "comprovantes/";

// Em produção (Vercel), o sistema de arquivos é efêmero — nada gravado em
// disco sobrevive além da própria invocação da função. Lá, os comprovantes
// vão pro Vercel Blob (store privado: só quem tem o token do servidor
// consegue ler, então continua valendo a mesma garantia de "só pela rota
// autenticada"). Fora da Vercel (dev local, `npm test`), fica em disco
// mesmo — mais rápido e não depende de rede/token pra rodar a suíte.
// `VERCEL` é definida automaticamente pela própria plataforma, então não
// precisa de nenhuma flag própria pra decidir isso.
const USE_BLOB = process.env.VERCEL === "1";

// Nome do arquivo em disco (ou pathname no Blob) é sempre gerado pelo
// servidor (UUID + extensão vinda do mapa de mime types validados) — o
// nome original enviado pelo cliente nunca chega a virar caminho de
// arquivo, o que elimina qualquer risco de path traversal via nome de
// arquivo malicioso.
export async function saveProofFile(
  buffer: Buffer,
  extension: string,
): Promise<string> {
  const fileName = `${randomUUID()}.${extension}`;

  if (USE_BLOB) {
    const blob = await put(`${BLOB_PREFIX}${fileName}`, buffer, {
      access: "private",
      addRandomSuffix: false,
    });
    return blob.pathname;
  }

  await mkdir(STORAGE_ROOT, { recursive: true });
  await writeFile(path.join(STORAGE_ROOT, fileName), buffer);
  return fileName;
}

export async function deleteProofFile(filePath: string): Promise<void> {
  try {
    if (USE_BLOB) {
      await del(filePath);
      return;
    }
    await unlink(path.join(STORAGE_ROOT, filePath));
  } catch (err) {
    // Best-effort: se a limpeza falhar, sobra um arquivo órfão inofensivo
    // (nenhuma linha no banco aponta pra ele) — não vale derrubar a
    // resposta ao usuário por causa disso.
    console.error("Falha ao remover arquivo órfão de comprovante:", filePath, err);
  }
}

export async function readProofFile(filePath: string): Promise<Buffer> {
  if (USE_BLOB) {
    const result = await get(filePath, { access: "private" });
    if (!result) {
      throw new Error(`Comprovante não encontrado no blob: ${filePath}`);
    }
    const arrayBuffer = await new Response(result.stream).arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  return readFile(path.join(STORAGE_ROOT, filePath));
}
