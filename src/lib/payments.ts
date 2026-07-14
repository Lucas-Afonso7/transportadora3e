// Sem "server-only" de propósito: este módulo é só matemática com Decimal,
// sem nenhuma API exclusiva de servidor (fs, sessão, banco) — pode rodar em
// testes (vitest, em Node puro) e, se um dia precisar, em client component.
import { Prisma } from "@/generated/prisma/client";

// Único lugar que sabe somar pagamentos por status. Usado tanto pra montar
// o painel do cliente (Etapa 4) quanto pra validar um novo pagamento
// (Etapa 5) — se essa conta divergir entre os dois lugares, um cliente
// poderia conseguir pagar mais do que deve, ou o painel mostraria um valor
// que não bate com o que a validação realmente aceita.
export function sumByStatus(
  payments: { amount: Prisma.Decimal; status: string }[],
  status: string,
): Prisma.Decimal {
  return payments
    .filter((p) => p.status === status)
    .reduce((acc, p) => acc.plus(p.amount), new Prisma.Decimal(0));
}

export function computeApprovedAmount(
  payments: { amount: Prisma.Decimal; status: string }[],
): Prisma.Decimal {
  return sumByStatus(payments, "APROVADO");
}

// "Falta pagar" considera só pagamentos já APROVADO — um comprovante ainda
// aguardando validação não abate o valor devido, senão dois pagamentos
// pendentes simultâneos (um deles depois rejeitado) poderiam deixar o
// serviço marcado como quitado sem nunca ter sido, de fato, pago.
export function computeRemainingAmount(
  totalAmount: Prisma.Decimal,
  payments: { amount: Prisma.Decimal; status: string }[],
): Prisma.Decimal {
  const approved = computeApprovedAmount(payments);
  return Prisma.Decimal.max(totalAmount.minus(approved), new Prisma.Decimal(0));
}
