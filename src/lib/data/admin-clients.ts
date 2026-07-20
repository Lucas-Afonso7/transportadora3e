import "server-only";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { computeApprovedAmount, computeRemainingAmount } from "@/lib/payments";
import {
  getClientServiceSummaries,
  type ClientServiceSummary,
} from "@/lib/data/client-dashboard";

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
