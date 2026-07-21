import Link from "next/link";
import { Receipt } from "lucide-react";
import { requireClientSession } from "@/lib/auth/session";
import { getClientPaymentHistory } from "@/lib/data/client-dashboard";
import { formatBRL, formatDateTime } from "@/lib/format";
import { Prisma } from "@/generated/prisma/client";
import { Table } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

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
      <h1 className="font-display text-2xl text-fg">Extrato de Pagamentos</h1>
      <p className="mt-1 text-sm text-fg-muted">
        Pagamentos já confirmados pelo Evaldo.
      </p>

      <div className="mt-6">
        {pagos.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Nenhum pagamento confirmado ainda"
            description="Assim que o Evaldo confirmar um pagamento, ele aparece aqui."
          />
        ) : (
          <Table minWidth={680}>
            <thead className="border-b border-border-muted text-fg-muted">
              <tr>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Enviado em
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Confirmado em
                </th>
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                  Valor
                </th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted">
              {pagos.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-fg-muted">
                    {formatDateTime(payment.createdAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-fg-muted">
                    {payment.reviewedAt
                      ? formatDateTime(payment.reviewedAt)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-fg">
                    {payment.serviceDescription}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium whitespace-nowrap text-fg">
                    {formatBRL(payment.amount)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
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
          </Table>
        )}
      </div>

      <div className="mt-4 text-right">
        <p className="text-sm text-fg-muted">
          Total Pago:{" "}
          <span className="font-mono text-lg font-semibold text-brand-700 dark:text-brand-400">
            {formatBRL(totalPago)}
          </span>
        </p>
      </div>
    </div>
  );
}
