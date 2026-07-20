import { describe, expect, it } from "vitest";
import { isRateLimited } from "./rate-limit";

// Testes de integração de verdade contra o Redis (Upstash) real — mesmo
// princípio dos testes de banco (vitest.setup.ts carrega .env, que tem
// UPSTASH_REDIS_REST_URL/TOKEN pra essa mesma instância usada em
// produção). Cada chamada de isRateLimited() é uma requisição HTTP
// independente ao Upstash, sem nenhum módulo/processo compartilhado
// entre elas — é exatamente a situação que quebrava com o Map em
// memória (duas invocações serverless diferentes não compartilhavam
// contador) e que precisa continuar funcionando com Redis.
const hasRedis = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

// 20-25 chamadas HTTP sequenciais de verdade passam do timeout padrão
// de teste (5s) sob qualquer latência de rede um pouco maior — timeout
// mais folgado em vez de mockar a chamada de rede.
const NETWORK_TEST_TIMEOUT = 20000;

function uniqueKey(label: string) {
  return `vitest:${label}:${Date.now()}:${Math.floor(Math.random() * 1e6)}`;
}

describe.skipIf(!hasRedis)("isRateLimited — com Redis configurado", () => {
  it(
    "permite as primeiras 20 tentativas",
    async () => {
      const key = uniqueKey("permite-20");

      for (let i = 0; i < 20; i++) {
        expect(await isRateLimited(key)).toBe(false);
      }
    },
    NETWORK_TEST_TIMEOUT,
  );

  it(
    "bloqueia a partir da 21ª tentativa — cada chamada isolada, sem estado local compartilhado",
    async () => {
      const key = uniqueKey("bloqueia-21");

      // 20 chamadas, cada uma sua própria invocação de isRateLimited
      // (sem reaproveitar nenhuma variável entre elas além da chave) —
      // simula o que aconteceria em 20 invocações serverless diferentes
      // batendo na mesma chave.
      for (let i = 0; i < 20; i++) {
        expect(await isRateLimited(key)).toBe(false);
      }

      expect(await isRateLimited(key)).toBe(true);
    },
    NETWORK_TEST_TIMEOUT,
  );

  it(
    "chaves diferentes (IPs diferentes) não se afetam",
    async () => {
      const keyA = uniqueKey("isolamento-a");
      const keyB = uniqueKey("isolamento-b");

      for (let i = 0; i < 25; i++) {
        await isRateLimited(keyA);
      }

      expect(await isRateLimited(keyA)).toBe(true);
      expect(await isRateLimited(keyB)).toBe(false);
    },
    NETWORK_TEST_TIMEOUT,
  );
});

describe.skipIf(hasRedis)(
  "isRateLimited — sem Redis configurado (fail-open)",
  () => {
    it("nunca bloqueia quando UPSTASH_REDIS_REST_URL/TOKEN não estão definidas", async () => {
      const key = uniqueKey("sem-redis");

      for (let i = 0; i < 25; i++) {
        expect(await isRateLimited(key)).toBe(false);
      }
    });
  },
);
