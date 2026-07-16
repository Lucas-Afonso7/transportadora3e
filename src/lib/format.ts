import { Prisma } from "@/generated/prisma/client";

export function formatBRL(value: Prisma.Decimal | string | number): string {
  const asNumber =
    typeof value === "object" ? Number(value.toString()) : Number(value);

  return asNumber.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Para colunas @db.Date (serviceDate, dueDate): o Prisma sempre devolve
// essas como meia-noite UTC, então exibir em UTC mostra o dia certo
// independente do fuso do servidor — converter pra horário local aqui
// poderia "voltar" a data um dia.
export function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

// Para colunas DateTime de verdade (createdAt, reviewedAt, uploadedAt):
// aqui sim precisa converter pro fuso do cliente (Brasil), senão um
// pagamento feito às 21h vira "dia seguinte" na tela por já ter passado
// da meia-noite UTC.
export function formatDateTime(date: Date): string {
  return date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

// Só o horário (HH:mm), mesmo fuso de formatDateTime — usado quando data e
// hora aparecem em campos separados na tela (ex.: "dia que pagou" /
// "horário que pagou").
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Espera o formato salvo em BusinessProfile.whatsappPhone: código do país +
// DDD + número, só dígitos (ex.: "5531995094324"). Formata pra exibição
// como "(31) 99509-4324"; se vier em outro formato, devolve como veio em
// vez de gerar um texto quebrado.
export function formatPhoneBR(digitsOnly: string): string {
  const match = /^55(\d{2})(\d{4,5})(\d{4})$/.exec(digitsOnly);
  if (!match) return digitsOnly;

  const [, ddd, prefix, suffix] = match;
  return `(${ddd}) ${prefix}-${suffix}`;
}
