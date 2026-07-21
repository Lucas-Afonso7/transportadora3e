import { requireAdminSession } from "@/lib/auth/session";
import { getFinancialOverview } from "@/lib/data/admin-finance";
import { formatBRL } from "@/lib/format";
import { FinanceiroPorClienteTable } from "@/components/admin/FinanceiroPorClienteTable";

export default async function FinanceiroPage() {
  await requireAdminSession();
  const { overview, porCliente } = await getFinancialOverview();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-fg">Financeiro</h1>
      <p className="mb-6 text-sm text-fg-muted">
        Visão geral de todos os clientes e serviços.
      </p>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-card border border-border bg-surface p-4 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
            Contratado
          </p>
          <p className="mt-1 text-xl font-semibold text-fg">
            {formatBRL(overview.totalContratado)}
          </p>
        </div>
        <div className="rounded-card border border-brand-500/30 bg-brand-tint p-4 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-tint-fg">
            Recebido
          </p>
          <p className="mt-1 text-xl font-semibold text-brand-tint-fg">
            {formatBRL(overview.totalRecebido)}
          </p>
        </div>
        <div className="rounded-card border border-warning-500 bg-warning-tint p-4 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-warning-tint-fg">
            Em aberto
          </p>
          <p className="mt-1 text-xl font-semibold text-warning-tint-fg">
            {formatBRL(overview.totalPendente)}
          </p>
        </div>
        <div className="rounded-card border border-info-500 bg-info-tint p-4 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-info-tint-fg">
            Parciais em aberto
          </p>
          <p className="mt-1 text-xl font-semibold text-info-tint-fg">
            {overview.servicosParciaisCount}
          </p>
          <p className="text-xs text-info-tint-fg">
            {formatBRL(overview.servicosParciaisValor)}
          </p>
        </div>
      </div>

      <h2 className="mb-3 text-base font-semibold text-fg">Por cliente</h2>

      {porCliente.length === 0 ? (
        <p className="text-sm text-fg-muted">
          Nenhum cliente com serviços cadastrados ainda.
        </p>
      ) : (
        <FinanceiroPorClienteTable porCliente={porCliente} />
      )}
    </div>
  );
}
