import { Inbox } from "lucide-react";
import { requireAdminSession } from "@/lib/auth/session";
import { getFinancialOverview } from "@/lib/data/admin-finance";
import { formatBRL } from "@/lib/format";
import { FinanceiroPorClienteTable } from "@/components/admin/FinanceiroPorClienteTable";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function FinanceiroPage() {
  await requireAdminSession();
  const { overview, porCliente } = await getFinancialOverview();

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl text-fg">Financeiro</h1>
      <p className="mb-6 text-sm text-fg-muted">
        Visão geral de todos os clientes e serviços.
      </p>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
            Contratado
          </p>
          <p className="font-display mt-1 text-xl text-fg">
            {formatBRL(overview.totalContratado)}
          </p>
        </Card>
        <Card tone="brand">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-tint-fg">
            Recebido
          </p>
          <p className="font-display mt-1 text-xl text-brand-tint-fg">
            {formatBRL(overview.totalRecebido)}
          </p>
        </Card>
        <Card tone="warning">
          <p className="text-xs font-medium uppercase tracking-wide text-warning-tint-fg">
            Em aberto
          </p>
          <p className="font-display mt-1 text-xl text-warning-tint-fg">
            {formatBRL(overview.totalPendente)}
          </p>
        </Card>
        <Card tone="info">
          <p className="text-xs font-medium uppercase tracking-wide text-info-tint-fg">
            Parciais em aberto
          </p>
          <p className="font-display mt-1 text-xl text-info-tint-fg">
            {overview.servicosParciaisCount}
          </p>
          <p className="font-mono text-xs text-info-tint-fg">
            {formatBRL(overview.servicosParciaisValor)}
          </p>
        </Card>
      </div>

      <h2 className="font-display mb-3 text-base text-fg">Por cliente</h2>

      {porCliente.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Nenhum cliente com serviços cadastrados ainda"
        />
      ) : (
        <FinanceiroPorClienteTable porCliente={porCliente} />
      )}
    </div>
  );
}
