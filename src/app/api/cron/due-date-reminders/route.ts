import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { saoPauloCalendarDateUTC } from "@/lib/date-bucket";
import { computeRemainingAmount } from "@/lib/payments";
import { sendPushToClient } from "@/lib/push-server";
import { formatBRL } from "@/lib/format";

const REMINDER_DAYS_BEFORE = 3;

// Roda 1x/dia (ver vercel.json) perto de 09:00 em São Paulo. Cobre dois
// avisos por serviço, cada um com sua própria flag pra nunca duplicar:
// "vence em exatamente 3 dias" e "vence hoje". Serviço já quitado (soma
// aprovada >= total) nunca entra na lista — reaproveita computeRemainingAmount,
// a mesma conta usada em todo o resto do app pra "quanto falta pagar".
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = saoPauloCalendarDateUTC(0);
  const threeDaysOut = saoPauloCalendarDateUTC(REMINDER_DAYS_BEFORE);

  const [dueToday, dueInThreeDays] = await Promise.all([
    findReminderCandidates(today),
    findReminderCandidates(threeDaysOut),
  ]);

  let sentToday = 0;
  for (const service of dueToday) {
    if (service.notifiedDueDateAt) continue;
    if (isFullyPaid(service)) continue;

    await sendPushToClient(service.clientId, {
      title: "Vencimento hoje",
      body: `"${service.description}" (${formatBRL(remainingOf(service))}) vence hoje.`,
      url: `/painel/servicos/${service.id}/detalhes`,
    });
    await prisma.service.update({
      where: { id: service.id },
      data: { notifiedDueDateAt: new Date() },
    });
    sentToday++;
  }

  let sentThreeDays = 0;
  for (const service of dueInThreeDays) {
    if (service.notifiedThreeDaysAt) continue;
    if (isFullyPaid(service)) continue;

    await sendPushToClient(service.clientId, {
      title: "Vencimento em 3 dias",
      body: `"${service.description}" (${formatBRL(remainingOf(service))}) vence em ${REMINDER_DAYS_BEFORE} dias.`,
      url: `/painel/servicos/${service.id}/detalhes`,
    });
    await prisma.service.update({
      where: { id: service.id },
      data: { notifiedThreeDaysAt: new Date() },
    });
    sentThreeDays++;
  }

  return NextResponse.json({ sentToday, sentThreeDays });
}

function findReminderCandidates(dueDate: Date) {
  return prisma.service.findMany({
    where: { dueDate },
    select: {
      id: true,
      clientId: true,
      description: true,
      totalAmount: true,
      notifiedDueDateAt: true,
      notifiedThreeDaysAt: true,
      payments: { select: { amount: true, status: true } },
    },
  });
}

type ReminderCandidate = Awaited<
  ReturnType<typeof findReminderCandidates>
>[number];

function remainingOf(service: ReminderCandidate) {
  return computeRemainingAmount(service.totalAmount, service.payments);
}

function isFullyPaid(service: ReminderCandidate): boolean {
  return remainingOf(service).isZero();
}
