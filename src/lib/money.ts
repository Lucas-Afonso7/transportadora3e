import { Prisma } from "@/generated/prisma/client";

// Só aceita "1234.56"-like (até 2 casas). Deliberadamente não usamos
// Number()/parseFloat em nenhum passo: ponto flutuante binário pode
// representar um valor como 19.99 de um jeito que, multiplicado ou
// arredondado, vira um centavo diferente do que o usuário digitou. Decimal
// é construído direto da string validada, sem passar por float.
const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

// Retorna null pra qualquer entrada inválida (formato errado, negativo,
// zero) — quem chama decide a mensagem de erro apropriada ao contexto.
export function parseAmountInput(raw: unknown): Prisma.Decimal | null {
  if (typeof raw !== "string") return null;

  const trimmed = raw.trim();
  if (!AMOUNT_PATTERN.test(trimmed)) return null;

  const amount = new Prisma.Decimal(trimmed);
  if (amount.lte(0)) return null;

  return amount;
}
