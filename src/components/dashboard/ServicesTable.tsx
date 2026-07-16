import Link from "next/link";
import { formatBRL, formatDate } from "@/lib/format";
import type { ClientServiceSummary } from "@/lib/data/client-dashboard";
import { ServiceStatusBadge } from "./StatusBadge";

export function ServicesTable({
  services,
  emptyMessage = "Nenhum serviço encontrado.",
}: {
  services: ClientServiceSummary[];
  emptyMessage?: string;
}) {
  if (services.length === 0) {
    return <p className="text-sm text-ink-500">{emptyMessage}</p>;
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-card border border-ink-200 bg-white shadow-card">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="border-b border-ink-100 text-ink-500">
            <tr>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Descrição</th>
              <th className="px-4 py-3 font-medium">Ação</th>
              <th className="px-4 py-3 text-right font-medium">Valor</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {services.map((service) => (
              <tr key={service.id}>
                <td className="px-4 py-3 text-ink-600">
                  {formatDate(service.serviceDate)}
                </td>
                <td className="px-4 py-3 text-ink-900">
                  {service.description}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {service.status !== "PAGO" && (
                      <Link
                        href={`/painel/servicos/${service.id}`}
                        className="inline-block rounded-control bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
                      >
                        Pagar
                      </Link>
                    )}
                    <Link
                      href={`/painel/servicos/${service.id}/detalhes`}
                      className="inline-block rounded-control border border-ink-300 px-3 py-1.5 text-xs font-medium text-ink-600 hover:border-ink-400"
                    >
                      Detalhes
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-medium text-ink-900">
                  {formatBRL(service.totalAmount)}
                </td>
                <td className="px-4 py-3">
                  <ServiceStatusBadge status={service.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pista de que dá pra arrastar a tabela — some em telas largas, onde
          tudo já cabe sem precisar rolar. */}
      <p className="mt-1.5 text-xs text-ink-400 sm:hidden">
        Arraste para o lado para ver valor e status →
      </p>
    </div>
  );
}
