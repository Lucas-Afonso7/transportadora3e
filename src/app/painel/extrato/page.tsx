import Link from "next/link";
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
      <h1 className="text-2xl font-bold text-fg">Extrato de Pagamentos</h1>
      <p className="mt-1 text-sm text-fg-muted">
        Pagamentos já confirmados pelo Evaldo.
      </p>

      <div className="mt-6 overflow-x-auto rounded-card border border-border bg-surface shadow-card">
        {pagos.length === 0 ? (
          <p className="p-4 text-sm text-fg-muted">
            Nenhum pagamento confirmado ainda.
          </p>
        ) : (
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-border-muted text-fg-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Enviado em</th>
                <th className="px-4 py-3 font-medium">Confirmado em</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 text-right font-medium">Valor</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted">
              {pagos.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-3 text-fg-muted">
                    {formatDateTime(payment.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-fg-muted">
                    {payment.reviewedAt
                      ? formatDateTime(payment.reviewedAt)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-fg">
                    {payment.serviceDescription}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-fg">
                    {formatBRL(payment.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/painel/servicos/${payment.serviceId}/detalhes`}
                      className="inline-block rounded-control border border-border px-3 py-1.5 text-xs font-medium text-fg-muted hover:border-fg-subtle"
                    >
                      Detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 text-right">
        <p className="text-sm text-fg-muted">
          Total Pago:{" "}
          <span className="text-lg font-semibold text-brand-700 dark:text-brand-400">
            {formatBRL(totalPago)}
          </span>
        </p>
      </div>
    </div>
  );
}
