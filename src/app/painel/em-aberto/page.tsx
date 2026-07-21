import { PackageCheck } from "lucide-react";
import { requireClientSession } from "@/lib/auth/session";
import { getClientServiceSummaries } from "@/lib/data/client-dashboard";
import { categorizePainelService } from "@/lib/service-status";
import { ServicesTable } from "@/components/dashboard/ServicesTable";

const FILTER_LABEL: Record<string, string> = {
  vencidos: "Vencidos",
  vencendo: "Vence em 7 dias",
};

export default async function EmAbertoPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const client = await requireClientSession();
  const { filtro } = await searchParams;

  const services = await getClientServiceSummaries(client.id);

  // Pago só aparece no Extrato — uma vez quitado, não faz sentido continuar
  // listado como "em aberto".
  const emAberto = services.filter((s) => s.status !== "PAGO");

  const filtered =
    filtro === "vencidos"
      ? emAberto.filter((s) => categorizePainelService(s) === "VENCIDO")
      : filtro === "vencendo"
        ? emAberto.filter(
            (s) => categorizePainelService(s) === "VENCE_EM_7_DIAS",
          )
        : emAberto;

  return (
    <div>
      <h1 className="font-display text-2xl text-fg">Em Aberto</h1>
      <p className="mt-1 text-sm text-fg-muted">
        {filtro && FILTER_LABEL[filtro]
          ? `Filtrando por: ${FILTER_LABEL[filtro]}`
          : "Serviços que ainda faltam pagar, total ou parcialmente."}
      </p>

      <div className="mt-6">
        <ServicesTable
          services={filtered}
          emptyMessage="Nenhum serviço em aberto — tudo pago!"
          emptyIcon={PackageCheck}
        />
      </div>
    </div>
  );
}
