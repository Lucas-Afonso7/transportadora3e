import { createServiceAction } from "@/app/admin/(protegido)/clientes/actions";

export function AddServiceForm({ clientId }: { clientId: number }) {
  return (
    <details className="rounded-card border border-border bg-surface p-4 shadow-card">
      <summary className="cursor-pointer text-sm font-medium text-brand-700 dark:text-brand-400">
        + Adicionar serviço
      </summary>

      <form action={createServiceAction} className="mt-4 space-y-3">
        <input type="hidden" name="clientId" value={clientId} />

        <div>
          <label className="mb-1 block text-xs font-medium text-fg-muted">
            Descrição
          </label>
          <input
            name="description"
            type="text"
            required
            placeholder="Ex.: Frete Belo Horizonte / São Paulo"
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
              required
              className="w-full rounded-control border border-border bg-page px-3 py-2 text-sm text-fg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-fg-muted">
              Data do serviço
            </label>
            <input
              name="serviceDate"
              type="date"
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
            className="w-full rounded-control border border-border bg-page px-3 py-2 text-sm text-fg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
          />
        </div>

        <button
          type="submit"
          className="rounded-control bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Adicionar serviço
        </button>
      </form>
    </details>
  );
}
