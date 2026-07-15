import "server-only";

import { prisma } from "@/lib/prisma";

export type ReviewQueueItem = {
  paymentId: number;
  amount: string;
  method: "PIX" | "DINHEIRO";
  createdAt: Date;
  clientName: string;
  clientDocNumber: string;
  serviceDescription: string;
  proofId: number | null;
  proofMimeType: string | null;
};

// Mais antigo primeiro: é uma fila, não um feed — o comprovante que está
// esperando há mais tempo deve ser o primeiro que o admin vê.
export async function getPendingReviewQueue(): Promise<ReviewQueueItem[]> {
  const payments = await prisma.payment.findMany({
    where: { status: "AGUARDANDO_VALIDACAO" },
    orderBy: { createdAt: "asc" },
    include: {
      client: { select: { name: true, docNumber: true } },
      service: { select: { description: true } },
      proof: { select: { id: true, mimeType: true } },
    },
  });

  return payments.map((payment) => ({
    paymentId: payment.id,
    amount: payment.amount.toString(),
    method: payment.method,
    createdAt: payment.createdAt,
    clientName: payment.client.name,
    clientDocNumber: payment.client.docNumber,
    serviceDescription: payment.service.description,
    proofId: payment.proof?.id ?? null,
    proofMimeType: payment.proof?.mimeType ?? null,
  }));
}
