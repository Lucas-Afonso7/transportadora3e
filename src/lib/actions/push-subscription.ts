"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireClientSession } from "@/lib/auth/session";

// Bate com o VARCHAR(191) real da coluna endpoint... na verdade endpoint é
// VARCHAR(500) (ver schema.prisma — URLs de push podem ser bem longas,
// principalmente as da Apple), então o limite aqui segue o mesmo valor.
const MAX_ENDPOINT_LENGTH = 500;

const subscriptionSchema = z.object({
  endpoint: z.string().trim().min(1).max(MAX_ENDPOINT_LENGTH),
  keys: z.object({
    p256dh: z.string().trim().min(1),
    auth: z.string().trim().min(1),
  }),
});

export async function savePushSubscription(
  subscriptionJson: unknown,
): Promise<{ ok: boolean }> {
  const client = await requireClientSession();
  const parsed = subscriptionSchema.safeParse(subscriptionJson);
  if (!parsed.success) return { ok: false };

  const { endpoint, keys } = parsed.data;

  // upsert por endpoint: o mesmo dispositivo pode chamar subscribe() de
  // novo (ex.: depois de limpar o Notification.permission) e o navegador
  // devolve o endpoint que já existia — sem upsert isso quebraria na
  // constraint @unique.
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: {
      clientId: client.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
    update: {
      clientId: client.id,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
  });

  return { ok: true };
}

export async function removePushSubscription(
  endpoint: string,
): Promise<{ ok: boolean }> {
  const client = await requireClientSession();
  if (typeof endpoint !== "string" || endpoint.length === 0) {
    return { ok: false };
  }

  // where composto (endpoint + clientId): garante que um cliente nunca
  // apaga a inscrição de outro só adivinhando/forjando um endpoint alheio.
  await prisma.pushSubscription.deleteMany({
    where: { endpoint, clientId: client.id },
  });

  return { ok: true };
}
