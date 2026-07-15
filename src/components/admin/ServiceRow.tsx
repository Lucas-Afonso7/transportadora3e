import { formatBRL, formatDate } from "@/lib/format";
import type { ClientServiceSummary } from "@/lib/data/client-dashboard";
import { ServiceStatusBadge } from "@/components/dashboard/StatusBadge";
import { updateServiceAction } from "@/app/admin/(protegido)/clientes/actions";

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function ServiceRow({ service }: { service: ClientServiceSummary }) {
  return (
    <div className="rounded-card border border-ink-200 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-ink-900">{service.description}</p>
          <p className="mt-0.5 text-sm text-ink-500">
            {formatDate(service.serviceDate)}
            {service.dueDate && ` · vence em ${formatDate(service.dueDate)}`}
          </p>
        </div>
        <ServiceStatusBadge status={service.status} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-ink-100 pt-3 text-sm">
        <div>
          <p className="text-ink-500">Total</p>
          <p className="font-medium text-ink-900">
            {formatBRL(service.totalAmount)}
          </p>
        </div>
        <div>
          <p className="text-ink-500">Pago</p>
          <p className="font-medium text-brand-700">
            {formatBRL(service.paidAmount)}
          </p>
        </div>
        <div>
          <p className="text-ink-500">Em aberto</p>
          <p className="font-medium text-warning-700">
            {formatBRL(service.remainingAmount)}
          </p>
        </div>
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-medium text-ink-500 hover:text-ink-900">
          Editar serviço
        </summary>

        <form
          action={updateServiceAction}
          className="mt-3 space-y-3 border-t border-ink-100 pt-3"
        >
          <input type="hidden" name="serviceId" value={service.id} />

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-600">
              Descrição
            </label>
            <input
              name="description"
              type="text"
              defaultValue={service.description}
              required
              className="w-full rounded-control border border-ink-300 px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-600">
                Valor total (R$)
              </label>
              <input
                name="totalAmount"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={service.totalAmount}
                required
                className="w-full rounded-control border border-ink-300 px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
              {Number(service.paidAmount) > 0 && (
                <p className="mt-1 text-xs text-ink-400">
                  Não pode ficar abaixo de {formatBRL(service.paidAmount)}{" "}
                  (já aprovado).
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-600">
                Data do serviço
              </label>
              <input
                name="serviceDate"
                type="date"
                defaultValue={toDateInputValue(service.serviceDate)}
                required
                className="w-full rounded-control border border-ink-300 px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-600">
              Vencimento (opcional)
            </label>
            <input
              name="dueDate"
              type="date"
              defaultValue={toDateInputValue(service.dueDate)}
              className="w-full rounded-control border border-ink-300 px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <button
            type="submit"
            className="rounded-control bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Salvar alterações
          </button>
        </form>
      </details>
    </div>
  );
}
