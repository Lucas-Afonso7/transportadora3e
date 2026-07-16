import { requireAdminSession } from "@/lib/auth/session";
import { getAuditLog } from "@/lib/data/admin-audit";
import { formatBRL, formatDateTime, formatTime } from "@/lib/format";

const ACTION_LABEL: Record<string, string> = {
  CRIADO: "Enviado pelo cliente",
  APROVADO: "Aprovado",
  REJEITADO: "Rejeitado",
  REENVIADO: "Reenviado",
};

const ACTION_STYLE: Record<string, string> = {
  CRIADO: "bg-info-tint text-info-tint-fg",
  APROVADO: "bg-brand-tint text-brand-tint-fg",
  REJEITADO: "bg-danger-tint text-danger-tint-fg",
  REENVIADO: "bg-info-tint text-info-tint-fg",
};

export default async function AuditoriaPage() {
  await requireAdminSession();
  const entries = await getAuditLog();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-ink-900">Auditoria</h1>
      <p className="mb-6 text-sm text-ink-500">
        Histórico completo de todas as mudanças de status de pagamento —
        quem fez, quando, e o valor antes/depois.
      </p>

      {entries.length === 0 ? (
        <p className="text-sm text-ink-500">Nenhum evento registrado ainda.</p>
      ) : (
        <div>
        <div className="overflow-x-auto rounded-card border border-ink-200 bg-white shadow-card">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-ink-100 text-ink-500">
              <tr>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Quando
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Evento
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Quem
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Cliente
                </th>
                <th className="px-4 py-3 font-medium">Serviço</th>
                <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-ink-600">
                    {formatDateTime(entry.createdAt)} às{" "}
                    {formatTime(entry.createdAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${ACTION_STYLE[entry.action] ?? ""}`}
                    >
                      {ACTION_LABEL[entry.action] ?? entry.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-ink-900">
                    {entry.actorLabel}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-ink-600">
                    {entry.clientName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-ink-600">
                    {entry.serviceDescription}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap font-medium text-ink-900">
                    {entry.amountBefore &&
                    entry.amountBefore !== entry.amountAfter ? (
                      <span className="text-xs text-ink-400">
                        {formatBRL(entry.amountBefore)} →{" "}
                      </span>
                    ) : null}
                    {formatBRL(entry.amountAfter)}
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
