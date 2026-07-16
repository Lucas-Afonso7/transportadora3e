import "server-only";

import { prisma } from "@/lib/prisma";
import { computeApprovedAmount } from "@/lib/payments";

export type ApprovePaymentOutcome = "ok" | "ja_revisado" | "excede_total";

// Núcleo da aprovação (Etapa 6), separado da Server Action pra testar
// direto contra o banco. Duas proteções de concorrência importantes pra
// dinheiro real, ambas dentro da mesma transação:
//
// 1) updateMany com WHERE status ainda AGUARDANDO_VALIDACAO: se o mesmo
//    pagamento for aprovado duas vezes (duplo clique, duas abas, dois
//    admins), a segunda tentativa não atualiza nada.
// 2) Recalcula a soma já aprovada do serviço e barra a aprovação se isso
//    faria o total pago passar do valor do serviço — cobre o caso de dois
//    pagamentos parciais ficarem pendentes ao mesmo tempo somando mais do
//    que o serviço vale.
export async function approvePayment(
  paymentId: number,
  adminId: number,
): Promise<ApprovePaymentOutcome> {
  return prisma.$transaction(async (tx): Promise<ApprovePaymentOutcome> => {
    const payment = await tx.payment.findUnique({ where: { id: paymentId } });

    if (!payment || payment.status !== "AGUARDANDO_VALIDACAO") {
      return "ja_revisado";
    }

    const service = await tx.service.findUniqueOrThrow({
      where: { id: payment.serviceId },
      include: { payments: { select: { amount: true, status: true } } },
    });

    // service.payments ainda traz este pagamento com status
    // AGUARDANDO_VALIDACAO (não mudamos nada ainda), então
    // computeApprovedAmount já exclui ele automaticamente.
    const alreadyApproved = computeApprovedAmount(service.payments);
    const projectedTotal = alreadyApproved.plus(payment.amount);

    if (projectedTotal.gt(service.totalAmount)) {
      return "excede_total";
    }

    const result = await tx.payment.updateMany({
      where: { id: paymentId, status: "AGUARDANDO_VALIDACAO" },
      data: {
        status: "APROVADO",
        reviewedByAdminId: adminId,
        reviewedAt: new Date(),
      },
    });

    if (result.count === 0) {
      return "ja_revisado";
    }

    await tx.auditLog.create({
      data: {
        paymentId,
        actorType: "ADMIN",
        actorAdminId: adminId,
        action: "APROVADO",
        statusBefore: "AGUARDANDO_VALIDACAO",
        statusAfter: "APROVADO",
        amountBefore: payment.amount,
        amountAfter: payment.amount,
      },
    });

    return "ok";
  });
}

export type RejectPaymentOutcome = "ok" | "ja_revisado" | "motivo_obrigatorio";

export async function rejectPayment(
  paymentId: number,
  adminId: number,
  reason: string,
): Promise<RejectPaymentOutcome> {
  const trimmedReason = reason.trim();
  if (trimmedReason.length === 0) return "motivo_obrigatorio";

  return prisma.$transaction(async (tx): Promise<RejectPaymentOutcome> => {
    const payment = await tx.payment.findUnique({ where: { id: paymentId } });
    if (!payment) return "ja_revisado";

    const result = await tx.payment.updateMany({
      where: { id: paymentId, status: "AGUARDANDO_VALIDACAO" },
      data: {
        status: "REJEITADO",
        reviewedByAdminId: adminId,
        reviewedAt: new Date(),
        rejectionReason: trimmedReason,
      },
    });

    if (result.count === 0) return "ja_revisado";

    await tx.auditLog.create({
      data: {
        paymentId,
        actorType: "ADMIN",
        actorAdminId: adminId,
        action: "REJEITADO",
        statusBefore: "AGUARDANDO_VALIDACAO",
        statusAfter: "REJEITADO",
        amountBefore: payment.amount,
        amountAfter: payment.amount,
      },
    });

    return "ok";
  });
}
