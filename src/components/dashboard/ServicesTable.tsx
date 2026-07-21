import Link from "next/link";
import { PackageSearch, type LucideIcon } from "lucide-react";
import { formatBRL, formatDate } from "@/lib/format";
import type { ClientServiceSummary } from "@/lib/data/client-dashboard";
import { ServiceStatusBadge } from "./StatusBadge";
import { Table } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

export function ServicesTable({
  services,
  emptyMessage = "Nenhum serviço encontrado.",
  emptyIcon: EmptyIcon = PackageSearch,
}: {
  services: ClientServiceSummary[];
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
}) {
  if (services.length === 0) {
    return <EmptyState icon={EmptyIcon} title={emptyMessage} />;
  }

  return (
    <Table minWidth={640}>
      <thead className="border-b border-border-muted text-fg-muted">
        <tr>
          <th className="px-4 py-3 font-medium whitespace-nowrap">Data</th>
          <th className="px-4 py-3 font-medium">Descrição</th>
          <th className="px-4 py-3 font-medium whitespace-nowrap">Ação</th>
          <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
            Valor
          </th>
          <th className="px-4 py-3 font-medium whitespace-nowrap">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border-muted">
        {services.map((service) => (
          <tr key={service.id}>
            <td className="px-4 py-3 whitespace-nowrap text-fg-muted">
              {formatDate(service.serviceDate)}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-fg">
              {service.description}
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
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
                  className="inline-block rounded-control border border-border px-3 py-1.5 text-xs font-medium text-fg-muted hover:border-fg-subtle"
                >
                  Detalhes
                </Link>
              </div>
            </td>
            <td className="px-4 py-3 text-right font-mono font-medium whitespace-nowrap text-fg">
              {formatBRL(service.totalAmount)}
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              <ServiceStatusBadge
                status={service.status}
                paidAmount={service.paidAmount}
                totalAmount={service.totalAmount}
                size="compact"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
