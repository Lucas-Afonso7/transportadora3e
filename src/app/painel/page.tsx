import Link from "next/link";
import { FileText, TriangleAlert, Clock, CircleCheck } from "lucide-react";
import { requireClientSession } from "@/lib/auth/session";
import {
  getClientServiceSummaries,
  summarizeClientTotals,
} from "@/lib/data/client-dashboard";
import { categorizePainelService } from "@/lib/service-status";
import { getBusinessProfile } from "@/lib/data/business-profile";
import { formatBRL } from "@/lib/format";
import { StatCard } from "@/components/dashboard/StatCard";
import { ServicesTable } from "@/components/dashboard/ServicesTable";
import { Footer } from "@/components/painel/Footer";

const RECENT_LIMIT = 5;

export default async function PainelPage({
  searchParams,
}: {
  searchParams: Promise<{ pagamento?: string }>;
}) {
  const client = await requireClientSession();
  const { pagamento } = await searchParams;

  const [services, businessProfile] = await Promise.all([
    getClientServiceSummaries(client.id),
    getBusinessProfile(),
  ]);
  const totals = summarizeClientTotals(services);

  const counts = { A_PAGAR: 0, VENCIDO: 0, VENCE_EM_7_DIAS: 0, PAGO: 0 };
  for (const service of services) {
    counts[categorizePainelService(service)]++;
  }

  // Pago já tem casa própria no Extrato — a lista "recente" do dashboard só
  // mostra o que ainda está em aberto, mesma regra da tela Em Aberto.
  const recentesEmAberto = services
    .filter((s) => s.status !== "PAGO")
    .slice(0, RECENT_LIMIT);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-fg">
          Gestão de Pagamentos
        </h1>
        <p className="mt-1 text-sm text-fg-muted">
          Acompanhe seus serviços contratados e pagamentos com a
          Transportadora 3E.
        </p>
      </div>

      {pagamento === "enviado" && (
        <p className="mb-6 rounded-control bg-brand-tint px-4 py-3 text-sm font-medium text-brand-tint-fg">
          Pagamento enviado! Assim que o Evaldo confirmar, o status aqui é
          atualizado.
        </p>
      )}

      {Number(totals.totalAguardandoValidacao) > 0 && (
        <p className="mb-6 rounded-control bg-info-tint px-4 py-3 text-sm font-medium text-info-tint-fg">
          {formatBRL(totals.totalAguardandoValidacao)} aguardando validação
          do Evaldo.
        </p>
      )}

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          href="/painel/em-aberto"
          icon={FileText}
          label="A Pagar"
          value={counts.A_PAGAR}
          tone="brand"
        />
        <StatCard
          href="/painel/em-aberto?filtro=vencidos"
          icon={TriangleAlert}
          label="Vencidos"
          value={counts.VENCIDO}
          tone="danger"
        />
        <StatCard
          href="/painel/em-aberto?filtro=vencendo"
          icon={Clock}
          label="7 Dias para Vencer"
          value={counts.VENCE_EM_7_DIAS}
          tone="warning"
        />
        <StatCard
          href="/painel/extrato"
          icon={CircleCheck}
          label="Pagos"
          value={counts.PAGO}
          tone="ink"
        />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-fg">
          Serviços em Aberto
        </h2>
        <Link
          href="/painel/em-aberto"
          className="rounded-control bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Ver Mais
        </Link>
      </div>

      <ServicesTable
        services={recentesEmAberto}
        emptyMessage="Nenhum serviço em aberto — tudo pago!"
      />

      <Footer whatsappPhone={businessProfile.whatsappPhone} />
    </div>
  );
}
