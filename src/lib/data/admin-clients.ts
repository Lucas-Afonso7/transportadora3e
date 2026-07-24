import "server-only";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { computeApprovedAmount, computeRemainingAmount } from "@/lib/payments";
import {
  getClientServiceSummaries,
  type ClientServiceSummary,
} from "@/lib/data/client-dashboard";
import {
  lastNMonthKeys,
  monthKeySaoPaulo,
  monthLabelPtBR,
} from "@/lib/date-bucket";

export type AdminClientSummary = {
  id: number;
  name: string;
  docNumber: string;
  phone: string;
  email: string | null;
  totalContratado: string;
  totalPago: string;
  totalPendente: string;
  createdAt: Date;
};

export async function getAllClients(): Promise<AdminClientSummary[]> {
  // select explícito (em vez de include): só os campos que essa função
  // usa. Sem isso o Prisma traz cada Client inteiro pra memória do
  // servidor — incluindo passwordHash — só pra montar a listagem.
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      docNumber: true,
      phone: true,
      email: true,
      createdAt: true,
      services: {
        select: {
          totalAmount: true,
          payments: { select: { amount: true, status: true } },
        },
      },
    },
  });

  return clients.map((client) => {
    const zero = new Prisma.Decimal(0);
    let totalContratado = zero;
    let totalPago = zero;
    let totalPendente = zero;

    for (const service of client.services) {
      totalContratado = totalContratado.plus(service.totalAmount);
      totalPago = totalPago.plus(computeApprovedAmount(service.payments));
      totalPendente = totalPendente.plus(
        computeRemainingAmount(service.totalAmount, service.payments),
      );
    }

    return {
      id: client.id,
      name: client.name,
      docNumber: client.docNumber,
      phone: client.phone,
      email: client.email,
      totalContratado: totalContratado.toString(),
      totalPago: totalPago.toString(),
      totalPendente: totalPendente.toString(),
      createdAt: client.createdAt,
    };
  });
}

export type AdminClientDetail = {
  id: number;
  name: string;
  docNumber: string;
  phone: string;
  email: string | null;
  services: ClientServiceSummary[];
};

export async function getClientDetail(
  clientId: number,
): Promise<AdminClientDetail | null> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      name: true,
      docNumber: true,
      phone: true,
      email: true,
    },
  });
  if (!client) return null;

  const services = await getClientServiceSummaries(clientId);

  return {
    id: client.id,
    name: client.name,
    docNumber: client.docNumber,
    phone: client.phone,
    email: client.email,
    services,
  };
}

export type ClientMonthlyPoint = {
  monthKey: string;
  label: string;
  contratado: string;
  pago: string;
  devido: string;
};

const CLIENT_MONTHLY_WINDOW = 6;

// Pura (sem query própria) — recebe os services que getClientDetail já
// buscou. Agrupa por serviceDate no fuso America/Sao_Paulo (mesma regra
// de fuso das Etapas anteriores) formando "coortes por mês de contratação":
// de tudo que foi contratado naquele mês, quanto já foi pago e quanto
// ainda está em aberto — por construção, devido = contratado - pago,
// sempre bate.
export function getClientMonthlyBreakdown(
  services: ClientServiceSummary[],
): ClientMonthlyPoint[] {
  const zero = new Prisma.Decimal(0);
  const buckets = new Map<
    string,
    { contratado: Prisma.Decimal; pago: Prisma.Decimal; devido: Prisma.Decimal }
  >();

  for (const service of services) {
    const key = monthKeySaoPaulo(service.serviceDate);
    const bucket = buckets.get(key) ?? {
      contratado: zero,
      pago: zero,
      devido: zero,
    };
    bucket.contratado = bucket.contratado.plus(service.totalAmount);
    bucket.pago = bucket.pago.plus(service.paidAmount);
    bucket.devido = bucket.devido.plus(service.remainingAmount);
    buckets.set(key, bucket);
  }

  return lastNMonthKeys(CLIENT_MONTHLY_WINDOW).map((key) => {
    const bucket = buckets.get(key);
    return {
      monthKey: key,
      label: monthLabelPtBR(key),
      contratado: (bucket?.contratado ?? zero).toString(),
      pago: (bucket?.pago ?? zero).toString(),
      devido: (bucket?.devido ?? zero).toString(),
    };
  });
}

export type ClientLoginHistoryItem = {
  id: number;
  createdAt: Date;
  ipAddress: string | null;
};

const LOGIN_HISTORY_LIMIT = 15;

export async function getClientLoginHistory(
  clientId: number,
): Promise<ClientLoginHistoryItem[]> {
  return prisma.clientLoginEvent.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    take: LOGIN_HISTORY_LIMIT,
    select: { id: true, createdAt: true, ipAddress: true },
  });
}
