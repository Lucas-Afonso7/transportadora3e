import "server-only";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { sumByStatus, computeRemainingAmount } from "@/lib/payments";

export type ServiceStatus = "PENDENTE" | "PARCIAL" | "PAGO";

export type ClientServiceSummary = {
  id: number;
  description: string;
  serviceDate: Date;
  dueDate: Date | null;
  totalAmount: string;
  paidAmount: string;
  remainingAmount: string;
  pendingValidationAmount: string;
  status: ServiceStatus;
};

export async function getClientServiceSummaries(
  clientId: number,
): Promise<ClientServiceSummary[]> {
  const services = await prisma.service.findMany({
    where: { clientId },
    orderBy: { serviceDate: "desc" },
    include: {
      payments: { select: { amount: true, status: true } },
    },
  });

  return services.map((service) => {
    const paidAmount = sumByStatus(service.payments, "APROVADO");
    const pendingValidationAmount = sumByStatus(
      service.payments,
      "AGUARDANDO_VALIDACAO",
    );
    const remainingAmount = computeRemainingAmount(
      service.totalAmount,
      service.payments,
    );

    const status: ServiceStatus = paidAmount.gte(service.totalAmount)
      ? "PAGO"
      : paidAmount.isZero()
        ? "PENDENTE"
        : "PARCIAL";

    return {
      id: service.id,
      description: service.description,
      serviceDate: service.serviceDate,
      dueDate: service.dueDate,
      totalAmount: service.totalAmount.toString(),
      paidAmount: paidAmount.toString(),
      remainingAmount: remainingAmount.toString(),
      pendingValidationAmount: pendingValidationAmount.toString(),
      status,
    };
  });
}

export type ClientPaymentHistoryItem = {
  id: number;
  serviceDescription: string;
  amount: string;
  method: "PIX" | "DINHEIRO";
  status: "AGUARDANDO_VALIDACAO" | "APROVADO" | "REJEITADO";
  createdAt: Date;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  proofId: number | null;
};

export async function getClientPaymentHistory(
  clientId: number,
): Promise<ClientPaymentHistoryItem[]> {
  const payments = await prisma.payment.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    include: {
      service: { select: { description: true } },
      proof: { select: { id: true } },
    },
  });

  return payments.map((payment) => ({
    id: payment.id,
    serviceDescription: payment.service.description,
    amount: payment.amount.toString(),
    method: payment.method,
    status: payment.status,
    createdAt: payment.createdAt,
    reviewedAt: payment.reviewedAt,
    rejectionReason: payment.rejectionReason,
    proofId: payment.proof?.id ?? null,
  }));
}

export type ClientTotals = {
  totalDevido: string;
  totalPago: string;
  totalAguardandoValidacao: string;
  totalEmAberto: string;
};

export function summarizeClientTotals(
  services: ClientServiceSummary[],
): ClientTotals {
  const zero = new Prisma.Decimal(0);

  const totalDevido = services.reduce(
    (acc, s) => acc.plus(s.totalAmount),
    zero,
  );
  const totalPago = services.reduce((acc, s) => acc.plus(s.paidAmount), zero);
  const totalAguardandoValidacao = services.reduce(
    (acc, s) => acc.plus(s.pendingValidationAmount),
    zero,
  );
  const totalEmAberto = services.reduce(
    (acc, s) => acc.plus(s.remainingAmount),
    zero,
  );

  return {
    totalDevido: totalDevido.toString(),
    totalPago: totalPago.toString(),
    totalAguardandoValidacao: totalAguardandoValidacao.toString(),
    totalEmAberto: totalEmAberto.toString(),
  };
}
