import { formatBRL, formatDate } from "@/lib/format";
import type { ClientServiceSummary } from "@/lib/data/client-dashboard";
import { ServiceStatusBadge } from "@/components/dashboard/StatusBadge";
import { updateServiceAction } from "@/app/admin/(protegido)/clientes/actions";
import { Card } from "@/components/ui/Card";

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function ServiceRow({ service }: { service: ClientServiceSummary }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-fg">{service.description}</p>
          <p className="mt-0.5 text-sm text-fg-muted">
            {formatDate(service.serviceDate)}
            {service.dueDate && ` · vence em ${formatDate(service.dueDate)}`}
          </p>
        </div>
        <ServiceStatusBadge
          status={service.status}
          paidAmount={service.paidAmount}
          totalAmount={service.totalAmount}
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border-muted pt-3 text-sm">
        <div>
          <p className="text-fg-muted">Total</p>
          <p className="font-mono font-medium text-fg">
            {formatBRL(service.totalAmount)}
          </p>
        </div>
        <div>
          <p className="text-fg-muted">Pago</p>
          <p className="font-mono font-medium text-brand-700 dark:text-brand-400">
            {formatBRL(service.paidAmount)}
          </p>
        </div>
        <div>
          <p className="text-fg-muted">Em aberto</p>
          <p className="font-mono font-medium text-warning-700 dark:text-warning-500">
            {formatBRL(service.remainingAmount)}
          </p>
        </div>
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-medium text-fg-muted hover:text-fg">
          Editar serviço
        </summary>

        <form
          action={updateServiceAction}
          className="mt-3 space-y-3 border-t border-border-muted pt-3"
        >
          <input type="hidden" name="serviceId" value={service.id} />

          <div>
            <label className="mb-1 block text-xs font-medium text-fg-muted">
              Descrição
            </label>
            <input
              name="description"
              type="text"
              defaultValue={service.description}
              required
              className="w-full rounded-control border border-border bg-page px-3 py-2 text-sm text-fg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-fg-muted">
                Valor total (R$)
              </label>
              <input
                name="totalAmount"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={service.totalAmount}
                required
                className="font-mono w-full rounded-control border border-border bg-page px-3 py-2 text-sm text-fg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
              />
              {Number(service.paidAmount) > 0 && (
                <p className="mt-1 text-xs text-fg-subtle">
                  Não pode ficar abaixo de {formatBRL(service.paidAmount)}{" "}
                  (já aprovado).
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-fg-muted">
                Data do serviço
              </label>
              <input
                name="serviceDate"
                type="date"
                defaultValue={toDateInputValue(service.serviceDate)}
                required
                className="w-full rounded-control border border-border bg-page px-3 py-2 text-sm text-fg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-fg-muted">
              Vencimento (opcional)
            </label>
            <input
              name="dueDate"
              type="date"
              defaultValue={toDateInputValue(service.dueDate)}
              className="w-full rounded-control border border-border bg-page px-3 py-2 text-sm text-fg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
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
    </Card>
  );
}
