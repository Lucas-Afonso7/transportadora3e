import Link from "next/link";
import { requireAdminSession } from "@/lib/auth/session";
import { getFinancialOverview } from "@/lib/data/admin-finance";
import { formatBRL } from "@/lib/format";

export default async function FinanceiroPage() {
  await requireAdminSession();
  const { overview, porCliente } = await getFinancialOverview();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-ink-900">Financeiro</h1>
      <p className="mb-6 text-sm text-ink-500">
        Visão geral de todos os clientes e serviços.
      </p>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-card border border-ink-200 bg-white p-4 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
            Contratado
          </p>
          <p className="mt-1 text-xl font-semibold text-ink-900">
            {formatBRL(overview.totalContratado)}
          </p>
        </div>
        <div className="rounded-card border border-brand-200 bg-brand-50 p-4 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-700">
            Recebido
          </p>
          <p className="mt-1 text-xl font-semibold text-brand-800">
            {formatBRL(overview.totalRecebido)}
          </p>
        </div>
        <div className="rounded-card border border-warning-500 bg-warning-50 p-4 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-warning-700">
            Em aberto
          </p>
          <p className="mt-1 text-xl font-semibold text-warning-700">
            {formatBRL(overview.totalPendente)}
          </p>
        </div>
        <div className="rounded-card border border-info-500 bg-info-50 p-4 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-info-700">
            Parciais em aberto
          </p>
          <p className="mt-1 text-xl font-semibold text-info-700">
            {overview.servicosParciaisCount}
          </p>
          <p className="text-xs text-info-700">
            {formatBRL(overview.servicosParciaisValor)}
          </p>
        </div>
      </div>

      <h2 className="mb-3 text-base font-semibold text-ink-900">Por cliente</h2>

      {porCliente.length === 0 ? (
        <p className="text-sm text-ink-500">
          Nenhum cliente com serviços cadastrados ainda.
        </p>
      ) : (
        <div>
        <div className="overflow-x-auto rounded-card border border-ink-200 bg-white shadow-card">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-ink-100 text-ink-500">
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
            <tbody className="divide-y divide-ink-100">
              {porCliente.map((row) => (
                <tr key={row.clientId} className="hover:bg-ink-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={`/admin/clientes/${row.clientId}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      {row.clientName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap text-ink-900">
                    {formatBRL(row.totalContratado)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap text-brand-700">
                    {formatBRL(row.totalPago)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap font-medium text-warning-700">
                    {formatBRL(row.totalPendente)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-1.5 text-xs text-ink-400 sm:hidden">
          Arraste para o lado para ver mais →
        </p>
        </div>
      )}
    </div>
  );
}
