import { requireClientSession } from "@/lib/auth/session";
import { getClientServiceSummaries } from "@/lib/data/client-dashboard";
import { categorizePainelService } from "@/lib/service-status";
import { MovimentacoesTable } from "@/components/dashboard/MovimentacoesTable";

const FILTER_LABEL: Record<string, string> = {
  vencidos: "Vencidos",
  vencendo: "Vence em 7 dias",
};

export default async function MovimentacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const client = await requireClientSession();
  const { filtro } = await searchParams;

  const services = await getClientServiceSummaries(client.id);

  const filtered =
    filtro === "vencidos"
      ? services.filter((s) => categorizePainelService(s) === "VENCIDO")
      : filtro === "vencendo"
        ? services.filter(
            (s) => categorizePainelService(s) === "VENCE_EM_7_DIAS",
          )
        : services;

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900">Movimentações</h1>
      <p className="mt-1 text-sm text-ink-500">
        {filtro && FILTER_LABEL[filtro]
          ? `Filtrando por: ${FILTER_LABEL[filtro]}`
          : "Todos os serviços contratados."}
      </p>

      <div className="mt-6">
        <MovimentacoesTable services={filtered} />
      </div>
    </div>
  );
}
