import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/auth/session";
import { getClientPaymentHistory } from "@/lib/data/client-dashboard";

// Endpoint leve só pra polling do ClientNotificationWatcher — devolve o
// status atual de cada pagamento do cliente logado, pra ele comparar com
// o status anterior e notificar quando um pagamento for aprovado/rejeitado.
export async function GET() {
  const client = await getClientSession();
  if (!client) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payments = await getClientPaymentHistory(client.id);

  return NextResponse.json({
    payments: payments.map((payment) => ({
      id: payment.id,
      status: payment.status,
      serviceDescription: payment.serviceDescription,
      amount: payment.amount,
    })),
  });
}
