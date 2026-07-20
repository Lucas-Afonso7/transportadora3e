import "server-only";

import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Antes disso era um Map em memória, pensado pra um processo Node de vida
// longa. A app roda na Vercel (funções serverless efêmeras) — sem estado
// compartilhado garantido entre instâncias, o Map não segurava o limite de
// verdade (cada cold start, ou cada instância concorrente sob carga, tinha
// seu próprio contador do zero). Redis (Upstash, via REST — funciona em
// runtime serverless/edge) resolve isso: toda instância lê e escreve o
// mesmo contador.
const WINDOW = "5 m";
const MAX_ATTEMPTS = 20;

// UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN vêm do ambiente
// (nunca hardcoded). Em dev local sem essas env vars configuradas, o rate
// limit por IP fica desligado — mas o bloqueio por conta (lockout.ts,
// independente disso) continua ativo, então login continua protegido
// mesmo sem Redis configurado localmente.
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(MAX_ATTEMPTS, WINDOW),
      prefix: "t3e-ratelimit",
      // Cada isRateLimited() já teria que ir na rede de qualquer forma;
      // analytics do próprio Upstash não muda esse custo e ajuda a
      // enxergar tentativa de força bruta pelo dashboard deles.
      analytics: true,
    })
  : null;

export async function isRateLimited(key: string): Promise<boolean> {
  if (!ratelimit) return false;

  try {
    const { success } = await ratelimit.limit(key);
    return !success;
  } catch (err) {
    // Fail-open deliberado: se o Redis estiver fora do ar, a tentativa
    // passa em vez de travar o login pra todo mundo. O bloqueio por
    // conta (lockout.ts, persistido no banco, independente do Redis)
    // continua de pé — um atacante ainda não consegue força bruta numa
    // conta específica só porque o rate limit por IP caiu. Fail-closed
    // trocaria uma indisponibilidade pontual do Redis por derrubar o
    // login inteiro — pior trade-off pro tamanho dessa operação.
    console.error("Rate limit indisponível (Redis):", err);
    return false;
  }
}

// Sem proxy reverso configurado, os headers abaixo não existem e todo
// mundo cai na mesma chave "unknown" — vira um limite global em vez de
// por IP. Na Vercel, x-forwarded-for sempre vem preenchido (o próprio
// edge da Vercel injeta), então esse fallback só importa em dev local
// sem proxy na frente.
export async function getRequestIp(): Promise<string> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIp = h.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}
