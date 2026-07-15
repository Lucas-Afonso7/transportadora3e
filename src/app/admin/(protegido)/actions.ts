"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/session";
import { computeApprovedAmount } from "@/lib/payments";

function parsePaymentId(formData: FormData): number | null {
  const raw = formData.get("paymentId");
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function approvePaymentAction(formData: FormData) {
  const admin = await requireAdminSession();
  const paymentId = parsePaymentId(formData);

  if (!paymentId) {
    redirect("/admin?erro=dados_invalidos");
  }

  type Outcome = "ok" | "ja_revisado" | "excede_total";

  // Cada branch retorna o desfecho diretamente (em vez de mutar uma
  // variável capturada pelo closure) — mais simples de ler e evita
  // depender de reatribuição dentro de callback assíncrono.
  const outcome = await prisma.$transaction(async (tx): Promise<Outcome> => {
    const payment = await tx.payment.findUnique({ where: { id: paymentId } });

    if (!payment || payment.status !== "AGUARDANDO_VALIDACAO") {
      return "ja_revisado";
    }

    // Confere de novo, na hora de aprovar, se isso não faz o total pago
    // passar do valor do serviço. Na submissão (Etapa 5) já validamos
    // contra o que faltava pagar, mas dois pagamentos podem ficar
    // "aguardando validação" ao mesmo tempo somando mais do que o serviço
    // vale — é aqui, na aprovação, que isso é definitivamente barrado.
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

    // updateMany com status ainda AGUARDANDO_VALIDACAO na condição: se
    // outra aba/admin já aprovou ou rejeitou isso entre a leitura acima e
    // aqui, count vem 0 e não fazemos nada — evita aprovar duas vezes.
    const result = await tx.payment.updateMany({
      where: { id: paymentId, status: "AGUARDANDO_VALIDACAO" },
      data: {
        status: "APROVADO",
        reviewedByAdminId: admin.id,
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
        actorAdminId: admin.id,
        action: "APROVADO",
        statusBefore: "AGUARDANDO_VALIDACAO",
        statusAfter: "APROVADO",
        amountBefore: payment.amount,
        amountAfter: payment.amount,
      },
    });

    return "ok";
  });

  if (outcome === "ja_revisado") redirect("/admin?erro=ja_revisado");
  if (outcome === "excede_total") redirect("/admin?erro=excede_total");
  redirect("/admin?sucesso=aprovado");
}

export async function rejectPaymentAction(formData: FormData) {
  const admin = await requireAdminSession();
  const paymentId = parsePaymentId(formData);
  const reasonRaw = formData.get("reason");
  const reason = typeof reasonRaw === "string" ? reasonRaw.trim() : "";

  if (!paymentId || reason.length === 0) {
    redirect("/admin?erro=dados_invalidos");
  }

  const wasUpdated = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { id: paymentId } });
    if (!payment) return false;

    const result = await tx.payment.updateMany({
      where: { id: paymentId, status: "AGUARDANDO_VALIDACAO" },
      data: {
        status: "REJEITADO",
        reviewedByAdminId: admin.id,
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
    });

    if (result.count === 0) return false;

    await tx.auditLog.create({
      data: {
        paymentId,
        actorType: "ADMIN",
        actorAdminId: admin.id,
        action: "REJEITADO",
        statusBefore: "AGUARDANDO_VALIDACAO",
        statusAfter: "REJEITADO",
        amountBefore: payment.amount,
        amountAfter: payment.amount,
      },
    });

    return true;
  });

  if (!wasUpdated) redirect("/admin?erro=ja_revisado");
  redirect("/admin?sucesso=rejeitado");
}
