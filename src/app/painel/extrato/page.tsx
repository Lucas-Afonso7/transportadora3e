import { requireClientSession } from "@/lib/auth/session";
import { getClientPaymentHistory } from "@/lib/data/client-dashboard";
import { formatBRL, formatDateTime } from "@/lib/format";
import { Prisma } from "@/generated/prisma/client";

export default async function ExtratoPage() {
  const client = await requireClientSession();
  const history = await getClientPaymentHistory(client.id);

  const pagos = history.filter((p) => p.status === "APROVADO");
  const totalPago = pagos.reduce(
    (acc, p) => acc.plus(p.amount),
    new Prisma.Decimal(0),
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900">Extrato de Pagamentos</h1>
      <p className="mt-1 text-sm text-ink-500">
        Pagamentos já confirmados pelo Evaldo.
      </p>

      <div className="mt-6 overflow-x-auto rounded-card border border-ink-200 bg-white shadow-card">
        {pagos.length === 0 ? (
          <p className="p-4 text-sm text-ink-500">
            Nenhum pagamento confirmado ainda.
          </p>
        ) : (
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-ink-100 text-ink-500">
              <tr>
                <th className="px-4 py-3 font-medium">Enviado em</th>
                <th className="px-4 py-3 font-medium">Confirmado em</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 text-right font-medium">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {pagos.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-3 text-ink-600">
                    {formatDateTime(payment.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {payment.reviewedAt
                      ? formatDateTime(payment.reviewedAt)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-900">
                    {payment.serviceDescription}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-ink-900">
                    {formatBRL(payment.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 text-right">
        <p className="text-sm text-ink-500">
          Total Pago:{" "}
          <span className="text-lg font-semibold text-brand-700">
            {formatBRL(totalPago)}
          </span>
        </p>
      </div>
    </div>
  );
}
