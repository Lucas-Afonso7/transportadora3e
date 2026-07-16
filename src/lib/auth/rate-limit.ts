import "server-only";

import { headers } from "next/headers";

// Complementa o bloqueio por conta (Etapa 3): aquele protege UMA conta
// contra tentativas repetidas; isso aqui protege contra um único IP
// varrendo MUITAS contas diferentes. Em memória mesmo — esse app roda
// como processo Node de vida longa (não serverless), então não precisa
// de Redis pra esse tamanho de operação. Reseta se o servidor reiniciar;
// aceitável pra esse porte.
const WINDOW_MS = 5 * 60 * 1000; // 5 minutos
const MAX_ATTEMPTS = 20;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function sweepExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

export function isRateLimited(key: string): boolean {
  const now = Date.now();

  // Limpeza probabilística em vez de um timer/interval — evita interação
  // esquisita com hot-reload do Next em dev, e é barata o suficiente.
  if (Math.random() < 0.01) sweepExpired(now);

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  bucket.count++;
  return bucket.count > MAX_ATTEMPTS;
}

// Sem proxy reverso configurado, os headers abaixo não existem e todo
// mundo cai no mesmo bucket "unknown" — vira um limite global em vez de
// por IP. MAX_ATTEMPTS é generoso o bastante pra não atrapalhar uso
// normal nesse cenário; em produção atrás de um proxy de verdade, os
// headers passam a vir preenchidos e o limite volta a ser por IP.
export async function getRequestIp(): Promise<string> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIp = h.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}
