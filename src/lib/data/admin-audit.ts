import "server-only";

import { prisma } from "@/lib/prisma";

export type AuditLogEntry = {
  id: number;
  createdAt: Date;
  actorLabel: string;
  action: "CRIADO" | "APROVADO" | "REJEITADO" | "REENVIADO";
  clientName: string;
  serviceDescription: string;
  statusBefore: string | null;
  statusAfter: string;
  amountBefore: string | null;
  amountAfter: string;
};

const DEFAULT_LIMIT = 200;

// Histórico completo e auditável exigido pelo requisito original: quem
// validou, quando, e o valor antes/depois de cada mudança de status de
// pagamento. Uma linha por evento (criação, aprovação, rejeição) — nunca
// uma alteração sem rastro, porque toda action que muda status já grava
// aqui na mesma transação (Etapa 5/6).
export async function getAuditLog(
  limit = DEFAULT_LIMIT,
): Promise<AuditLogEntry[]> {
  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      payment: {
        select: {
          client: { select: { name: true } },
          service: { select: { description: true } },
        },
      },
      actorAdmin: { select: { name: true } },
    },
  });

  return entries.map((entry) => ({
    id: entry.id,
    createdAt: entry.createdAt,
    actorLabel:
      entry.actorType === "ADMIN"
        ? (entry.actorAdmin?.name ?? "Admin")
        : entry.payment.client.name,
    action: entry.action,
    clientName: entry.payment.client.name,
    serviceDescription: entry.payment.service.description,
    statusBefore: entry.statusBefore,
    statusAfter: entry.statusAfter,
    amountBefore: entry.amountBefore?.toString() ?? null,
    amountAfter: entry.amountAfter.toString(),
  }));
}
