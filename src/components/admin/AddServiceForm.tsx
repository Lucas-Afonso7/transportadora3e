import { createServiceAction } from "@/app/admin/(protegido)/clientes/actions";

export function AddServiceForm({ clientId }: { clientId: number }) {
  return (
    <details className="rounded-card border border-ink-200 bg-white p-4 shadow-card">
      <summary className="cursor-pointer text-sm font-medium text-brand-700">
        + Adicionar serviço
      </summary>

      <form action={createServiceAction} className="mt-4 space-y-3">
        <input type="hidden" name="clientId" value={clientId} />

        <div>
          <label className="mb-1 block text-xs font-medium text-ink-600">
            Descrição
          </label>
          <input
            name="description"
            type="text"
            required
            placeholder="Ex.: Frete Belo Horizonte / São Paulo"
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
              required
              className="w-full rounded-control border border-ink-300 px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-600">
              Data do serviço
            </label>
            <input
              name="serviceDate"
              type="date"
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
            className="w-full rounded-control border border-ink-300 px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
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
