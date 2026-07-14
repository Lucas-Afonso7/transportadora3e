import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientSession, getAdminSession } from "@/lib/auth/session";
import { readProofFile } from "@/lib/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ proofId: string }> },
) {
  const { proofId } = await params;
  const id = Number(proofId);

  if (!Number.isInteger(id) || id <= 0) {
    return new Response("Not found", { status: 404 });
  }

  const [client, admin] = await Promise.all([
    getClientSession(),
    getAdminSession(),
  ]);

  if (!client && !admin) {
    return new Response("Unauthorized", { status: 401 });
  }

  const proof = await prisma.paymentProof.findUnique({
    where: { id },
    include: { payment: { select: { clientId: true } } },
  });

  if (!proof) {
    return new Response("Not found", { status: 404 });
  }

  // Cliente só vê o próprio comprovante; admin vê qualquer um. Mesma regra
  // de isolamento usada no resto do painel do cliente, aplicada aqui pra
  // um arquivo não vazar por quem souber/adivinhar o ID.
  if (client && proof.payment.clientId !== client.id) {
    return new Response("Forbidden", { status: 403 });
  }

  const fileBuffer = await readProofFile(proof.filePath);

  return new Response(new Uint8Array(fileBuffer), {
    headers: {
      "Content-Type": proof.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(proof.originalFileName)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
