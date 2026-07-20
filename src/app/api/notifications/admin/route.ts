import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { getPendingReviewQueue } from "@/lib/data/admin-review-queue";

// Endpoint leve só pra polling do AdminNotificationWatcher — devolve o
// necessário pra montar a notificação (nome do cliente, valor, método),
// sem o resto do payload de getPendingReviewQueue que a tela usa.
export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const queue = await getPendingReviewQueue();

  return NextResponse.json({
    items: queue.map((item) => ({
      paymentId: item.paymentId,
      clientName: item.clientName,
      amount: item.amount,
      method: item.method,
    })),
  });
}
