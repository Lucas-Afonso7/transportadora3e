import "server-only";

import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/format";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT;

if (!publicKey || !privateKey || !subject) {
  throw new Error(
    "VAPID não configurado (NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT).",
  );
}

webpush.setVapidDetails(subject, publicKey, privateKey);

export type PushPayload = {
  title: string;
  body: string;
  url: string;
};

// Manda a mesma notificação pra todos os dispositivos inscritos do
// cliente (pode ter mais de um — celular e PC, por exemplo). Cada envio é
// independente: uma subscription morta (410/404 — usuário desinstalou o
// PWA, trocou de navegador etc.) não derruba as outras, só é apagada do
// banco pra parar de tentar de novo toda vez.
export async function sendPushToClient(
  clientId: number,
  payload: PushPayload,
): Promise<void> {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { clientId },
  });

  if (subscriptions.length === 0) return;

  const body = JSON.stringify(payload);

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          body,
        );
      } catch (error) {
        const statusCode =
          typeof error === "object" && error !== null && "statusCode" in error
            ? (error as { statusCode: number }).statusCode
            : null;

        // 404/410 = o próprio serviço de push (Google, Mozilla, Apple...)
        // confirma que esse endpoint não existe mais. Qualquer outro erro
        // (rede instável, etc.) é só logado — não apaga a inscrição à toa.
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription
            .delete({ where: { id: subscription.id } })
            .catch(() => {});
        } else {
          console.error("Falha ao enviar push:", error);
        }
      }
    }),
  );
}

// Chamado de admin/(protegido)/actions.ts DEPOIS que approvePayment() já
// confirmou a transação — nunca dentro dela, pra uma falha de rede no envio
// do push nunca poder derrubar a aprovação em si (o pagamento já está
// aprovado no banco nesse ponto, o push é só um aviso a mais). Por isso essa
// função não mexe em nada do estado do pagamento, só lê o que já foi salvo.
export async function notifyPaymentApproved(paymentId: number): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: {
      clientId: true,
      amount: true,
      service: { select: { id: true, description: true } },
    },
  });
  if (!payment) return;

  await sendPushToClient(payment.clientId, {
    title: "Pagamento aprovado",
    body: `Seu pagamento de ${formatBRL(payment.amount)} para "${payment.service.description}" foi aprovado.`,
    url: `/painel/servicos/${payment.service.id}/detalhes`,
  });
}
