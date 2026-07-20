import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/auth/session";
import {
  getClientPaymentHistory,
  getClientServiceSummaries,
} from "@/lib/data/client-dashboard";

// Endpoint leve só pra polling do ClientNotificationWatcher — devolve o
// status atual de cada pagamento (pra notificar aprovado/rejeitado) e a
// lista de serviços (pra notificar quando um serviço novo é cadastrado)
// do cliente logado.
export async function GET() {
  const client = await getClientSession();
  if (!client) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [payments, services] = await Promise.all([
    getClientPaymentHistory(client.id),
    getClientServiceSummaries(client.id),
  ]);

  return NextResponse.json({
    payments: payments.map((payment) => ({
      id: payment.id,
      status: payment.status,
      serviceDescription: payment.serviceDescription,
      amount: payment.amount,
    })),
    services: services.map((service) => ({
      id: service.id,
      description: service.description,
      totalAmount: service.totalAmount,
    })),
  });
}
