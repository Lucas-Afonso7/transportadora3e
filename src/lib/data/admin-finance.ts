import "server-only";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { computeApprovedAmount, computeRemainingAmount } from "@/lib/payments";

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
  totalContratado: string;
  totalPago: string;
  totalPendente: string;
};

export async function getFinancialOverview(): Promise<{
  overview: FinancialOverview;
  porCliente: ClientFinancialRow[];
}> {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    include: {
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
