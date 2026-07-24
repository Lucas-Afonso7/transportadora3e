import type { AdminClientSummary } from "@/lib/data/admin-clients";

export type ClientSortKey =
  | "name-asc"
  | "name-desc"
  | "contratado-desc"
  | "contratado-asc"
  | "pendente-desc"
  | "pendente-asc"
  | "date-desc"
  | "date-asc";

// Sempre devolve um array novo (nunca muta o que recebeu) — quem chama
// pode ter esse array vindo direto de uma prop/estado do React.
export function sortClients(
  clients: AdminClientSummary[],
  sortKey: ClientSortKey,
): AdminClientSummary[] {
  const sorted = [...clients];

  switch (sortKey) {
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name, "pt-BR"));
    case "contratado-desc":
      return sorted.sort(
        (a, b) => Number(b.totalContratado) - Number(a.totalContratado),
      );
    case "contratado-asc":
      return sorted.sort(
        (a, b) => Number(a.totalContratado) - Number(b.totalContratado),
      );
    case "pendente-desc":
      return sorted.sort(
        (a, b) => Number(b.totalPendente) - Number(a.totalPendente),
      );
    case "pendente-asc":
      return sorted.sort(
        (a, b) => Number(a.totalPendente) - Number(b.totalPendente),
      );
    case "date-desc":
      return sorted.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
    case "date-asc":
      return sorted.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );
  }
}
