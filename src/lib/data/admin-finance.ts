import "server-only";

import { prisma } from "@/lib/prisma";
import { Prisma, PaymentStatus } from "@/generated/prisma/client";
import { computeApprovedAmount, computeRemainingAmount } from "@/lib/payments";
import {
  dayOfMonthSaoPaulo,
  lastNMonthKeys,
  monthKeySaoPaulo,
  monthLabelPtBR,
} from "@/lib/date-bucket";

export type FinancialOverview = {
  totalContratado: string;
  totalRecebido: string;
  totalPendente: string;
  servicosParciaisCount: number;
  servicosParciaisValor: string;
};

export type ClientFinancialRow = {
  clientId: number;
  clientName: string;
  clientDocNumber: string;
  totalContratado: string;
  totalPago: string;
  totalPendente: string;
};

export async function getFinancialOverview(): Promise<{
  overview: FinancialOverview;
  porCliente: ClientFinancialRow[];
}> {
  // select explícito (em vez de include): só os campos que essa função
  // usa. Sem isso o Prisma traz cada Client inteiro pra memória do
  // servidor — incluindo passwordHash — só pra montar um resumo com
  // nome e totais. Nunca vazou pro navegador (porCliente abaixo só
  // pega os campos escolhidos a dedo), mas o select elimina essa classe
  // de erro na raiz em vez de depender de sempre lembrar disso.
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      docNumber: true,
      services: {
        select: {
          totalAmount: true,
          payments: { select: { amount: true, status: true } },
        },
      },
    },
  });

  const zero = new Prisma.Decimal(0);
  let totalContratado = zero;
  let totalRecebido = zero;
  let totalPendente = zero;
  let servicosParciaisCount = 0;
  let servicosParciaisValor = zero;

  const porCliente: ClientFinancialRow[] = [];

  for (const client of clients) {
    let clienteContratado = zero;
    let clientePago = zero;
    let clientePendente = zero;

    for (const service of client.services) {
      const approved = computeApprovedAmount(service.payments);
      const remaining = computeRemainingAmount(
        service.totalAmount,
        service.payments,
      );

      clienteContratado = clienteContratado.plus(service.totalAmount);
      clientePago = clientePago.plus(approved);
      clientePendente = clientePendente.plus(remaining);

      // "Parcial em aberto": já recebeu alguma coisa nesse serviço, mas
      // ainda falta receber o resto — é o caso que mais precisa de
      // atenção do admin (nem "esquecido" nem "resolvido").
      if (!approved.isZero() && remaining.gt(0)) {
        servicosParciaisCount++;
        servicosParciaisValor = servicosParciaisValor.plus(remaining);
      }
    }

    totalContratado = totalContratado.plus(clienteContratado);
    totalRecebido = totalRecebido.plus(clientePago);
    totalPendente = totalPendente.plus(clientePendente);

    if (client.services.length > 0) {
      porCliente.push({
        clientId: client.id,
        clientName: client.name,
        clientDocNumber: client.docNumber,
        totalContratado: clienteContratado.toString(),
        totalPago: clientePago.toString(),
        totalPendente: clientePendente.toString(),
      });
    }
  }

  return {
    overview: {
      totalContratado: totalContratado.toString(),
      totalRecebido: totalRecebido.toString(),
      totalPendente: totalPendente.toString(),
      servicosParciaisCount,
      servicosParciaisValor: servicosParciaisValor.toString(),
    },
    porCliente,
  };
}

export type MonthlyRevenuePoint = {
  monthKey: string;
  label: string;
  total: string;
};

const MONTHLY_REVENUE_WINDOW = 6;

// Recebido por mês (últimos 6 meses, mês corrente incluso) pro gráfico do
// Financeiro. Agrupa por reviewedAt no fuso America/Sao_Paulo (ver
// src/lib/date-bucket.ts) — só exibição, não entra em nenhum total ou
// decisão de negócio.
export async function getMonthlyRevenue(): Promise<MonthlyRevenuePoint[]> {
  const payments = await prisma.payment.findMany({
    where: { status: "APROVADO", reviewedAt: { not: null } },
    select: { amount: true, reviewedAt: true },
  });

  const totalsByMonth = new Map<string, Prisma.Decimal>();
  for (const payment of payments) {
    const key = monthKeySaoPaulo(payment.reviewedAt!);
    totalsByMonth.set(
      key,
      (totalsByMonth.get(key) ?? new Prisma.Decimal(0)).plus(payment.amount),
    );
  }

  return lastNMonthKeys(MONTHLY_REVENUE_WINDOW).map((key) => ({
    monthKey: key,
    label: monthLabelPtBR(key),
    total: (totalsByMonth.get(key) ?? new Prisma.Decimal(0)).toString(),
  }));
}

// monthKey ("AAAA-MM") -> dia do mês -> soma de Payment.amount recebido
// naquele dia (só APROVADO). Mesma métrica de getMonthlyRevenue, só que por
// dia em vez de por mês — alimenta o calendário de detalhe ao clicar numa
// barra do gráfico "Recebido por mês". reviewedAt é DateTime de verdade
// (não @db.Date), então dayOfMonthSaoPaulo é o helper certo aqui.
export async function getDailyRevenueBreakdown(): Promise<
  Record<string, Record<number, string>>
> {
  const payments = await prisma.payment.findMany({
    where: { status: "APROVADO", reviewedAt: { not: null } },
    select: { amount: true, reviewedAt: true },
  });

  const byMonth = new Map<string, Map<number, Prisma.Decimal>>();
  for (const payment of payments) {
    const monthKey = monthKeySaoPaulo(payment.reviewedAt!);
    const day = dayOfMonthSaoPaulo(payment.reviewedAt!);
    const monthMap = byMonth.get(monthKey) ?? new Map<number, Prisma.Decimal>();
    monthMap.set(
      day,
      (monthMap.get(day) ?? new Prisma.Decimal(0)).plus(payment.amount),
    );
    byMonth.set(monthKey, monthMap);
  }

  const result: Record<string, Record<number, string>> = {};
  for (const [monthKey, monthMap] of byMonth) {
    result[monthKey] = {};
    for (const [day, total] of monthMap) {
      result[monthKey][day] = total.toString();
    }
  }
  return result;
}

export type PaymentStatusCount = {
  status: PaymentStatus;
  count: number;
};

// Distribuição de todos os pagamentos por status (contagem total, sem
// recorte de período) pro gráfico do Financeiro.
export async function getPaymentStatusBreakdown(): Promise<
  PaymentStatusCount[]
> {
  const grouped = await prisma.payment.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const countByStatus = new Map(
    grouped.map((g) => [g.status, g._count._all]),
  );

  const order: PaymentStatus[] = [
    "AGUARDANDO_VALIDACAO",
    "APROVADO",
    "REJEITADO",
  ];

  return order.map((status) => ({
    status,
    count: countByStatus.get(status) ?? 0,
  }));
}
