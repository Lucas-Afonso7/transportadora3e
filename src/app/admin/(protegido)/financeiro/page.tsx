import Link from "next/link";
import { requireAdminSession } from "@/lib/auth/session";
import { getFinancialOverview } from "@/lib/data/admin-finance";
import { formatBRL } from "@/lib/format";

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
        <div>
        <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-card">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-border-muted text-fg-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                  Contratado
                </th>
                <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                  Recebido
                </th>
                <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                  Em aberto
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted">
              {porCliente.map((row) => (
                <tr key={row.clientId} className="hover:bg-surface-hover">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={`/admin/clientes/${row.clientId}`}
                      className="font-medium text-brand-700 hover:underline dark:text-brand-400"
                    >
                      {row.clientName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap text-fg">
                    {formatBRL(row.totalContratado)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap text-brand-700 dark:text-brand-400">
                    {formatBRL(row.totalPago)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap font-medium text-warning-700 dark:text-warning-500">
                    {formatBRL(row.totalPendente)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-1.5 text-xs text-fg-subtle sm:hidden">
          Arraste para o lado para ver mais →
        </p>
        </div>
      )}
    </div>
  );
}
