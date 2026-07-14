import { Prisma } from "@/generated/prisma/client";

export function formatBRL(value: Prisma.Decimal | string | number): string {
  const asNumber =
    typeof value === "object" ? Number(value.toString()) : Number(value);

  return asNumber.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}
