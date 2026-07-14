import { formatBRL, formatDate } from "@/lib/format";
import type { ClientServiceSummary } from "@/lib/data/client-dashboard";
import { ServiceStatusBadge } from "./StatusBadge";

export function ServiceCard({ service }: { service: ClientServiceSummary }) {
  const hasPendingValidation = Number(service.pendingValidationAmount) > 0;

  return (
    <div className="rounded-card border border-ink-200 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-ink-900">{service.description}</p>
          <p className="mt-0.5 text-sm text-ink-500">
            {formatDate(service.serviceDate)}
          </p>
        </div>
        <ServiceStatusBadge status={service.status} />
      </div>

      <div className="mt-3 flex items-baseline justify-between border-t border-ink-100 pt-3">
        <span className="text-sm text-ink-500">Valor do serviço</span>
        <span className="font-semibold text-ink-900">
          {formatBRL(service.totalAmount)}
        </span>
      </div>

      {service.status !== "PENDENTE" && (
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-sm text-ink-500">Pago</span>
          <span className="text-sm font-medium text-brand-700">
            {formatBRL(service.paidAmount)}
          </span>
        </div>
      )}

      {service.status !== "PAGO" && (
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-sm text-ink-500">Falta pagar</span>
          <span className="text-sm font-medium text-ink-900">
            {formatBRL(service.remainingAmount)}
          </span>
        </div>
      )}

      {hasPendingValidation && (
        <p className="mt-3 rounded-control bg-info-50 px-3 py-2 text-xs font-medium text-info-700">
          {formatBRL(service.pendingValidationAmount)} aguardando validação do
          comprovante
        </p>
      )}
    </div>
  );
}
