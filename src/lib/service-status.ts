// Sem "server-only": é só data/lógica pura, sem banco nem sessão — pode
// rodar em testes (vitest) sem precisar de contexto de servidor Next.js.
import type { ServiceStatus } from "@/lib/data/client-dashboard";

// Categorias dos 4 cards do dashboard do cliente ("A Pagar / Vencidos /
// Vence em 7 dias / Pagos"). Mutuamente exclusivas de propósito — cada
// serviço cai em uma só categoria, senão os 4 números do topo do painel
// não bateriam com o total de serviços e o cliente ficaria sem saber se
// "Vencidos" já está contado dentro de "A Pagar" ou não.
export type PainelCategory = "PAGO" | "VENCIDO" | "VENCE_EM_7_DIAS" | "A_PAGAR";

export const DUE_SOON_DAYS = 7;

export function categorizePainelService(
  service: { status: ServiceStatus; dueDate: Date | null },
  referenceDate: Date = new Date(),
): PainelCategory {
  if (service.status === "PAGO") return "PAGO";
  if (!service.dueDate) return "A_PAGAR";

  // Compara só a parte da data (sem hora), em UTC — dueDate vem de uma
  // coluna @db.Date, que o Prisma sempre representa à meia-noite UTC.
  // Comparar contra a hora local do servidor causaria um serviço vencendo
  // "hoje" a cair pro lado errado dependendo do fuso onde o processo roda.
  const today = new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate(),
    ),
  );
  const dueSoonLimit = new Date(today);
  dueSoonLimit.setUTCDate(dueSoonLimit.getUTCDate() + DUE_SOON_DAYS);

  if (service.dueDate < today) return "VENCIDO";
  if (service.dueDate <= dueSoonLimit) return "VENCE_EM_7_DIAS";
  return "A_PAGAR";
}
