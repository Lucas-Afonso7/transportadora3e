import { notFound } from "next/navigation";
import Link from "next/link";
import { requireClientSession } from "@/lib/auth/session";
import { getServiceDetail } from "@/lib/data/client-dashboard";
import { formatBRL, formatDate, formatDateTime, formatTime } from "@/lib/format";
import {
  ServiceStatusBadge,
  PaymentStatusBadge,
} from "@/components/dashboard/StatusBadge";

const METHOD_LABEL: Record<"PIX" | "DINHEIRO", string> = {
  PIX: "Pix",
  DINHEIRO: "Dinheiro",
};

export default async function DetalhesServicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const client = await requireClientSession();
  const { id } = await params;
  const serviceId = Number(id);

  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    notFound();
  }

  const service = await getServiceDetail(client.id, serviceId);
  if (!service) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/painel/em-aberto"
        className="mb-4 inline-block text-sm text-fg-muted hover:text-fg"
      >
        ← Voltar
      </Link>

      <div className="rounded-card border border-border bg-surface p-5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-fg">{service.description}</p>
            <p className="mt-1 text-sm text-fg-muted">
              Solicitado em {formatDate(service.serviceDate)}
              {service.dueDate &&
                ` · vencimento em ${formatDate(service.dueDate)}`}
            </p>
          </div>
          <ServiceStatusBadge status={service.status} />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border-muted pt-4 text-sm">
          <div>
            <p className="text-fg-muted">Total</p>
            <p className="font-medium text-fg">
              {formatBRL(service.totalAmount)}
            </p>
          </div>
          <div>
            <p className="text-fg-muted">Pago</p>
            <p className="font-medium text-brand-700 dark:text-brand-400">
              {formatBRL(service.paidAmount)}
            </p>
          </div>
          <div>
            <p className="text-fg-muted">Em aberto</p>
            <p className="font-medium text-warning-700 dark:text-warning-500">
              {formatBRL(service.remainingAmount)}
            </p>
          </div>
        </div>

        {service.status !== "PAGO" && (
          <Link
            href={`/painel/servicos/${service.id}`}
            className="mt-4 block rounded-control bg-brand-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand-700"
          >
            Pagar
          </Link>
        )}
      </div>

      <h2 className="mb-3 mt-6 text-base font-semibold text-fg">
        Histórico de pagamentos deste serviço
      </h2>

      {service.payments.length === 0 ? (
        <p className="text-sm text-fg-muted">
          Nenhum pagamento enviado pra esse serviço ainda.
        </p>
      ) : (
        <div className="space-y-3">
          {service.payments.map((payment) => (
            <div
              key={payment.id}
              className="rounded-card border border-border bg-surface p-4 shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-fg">
                    {formatBRL(payment.amount)}
                  </p>
                  <p className="text-sm text-fg-muted">
                    {METHOD_LABEL[payment.method]}
                  </p>
                </div>
                <PaymentStatusBadge status={payment.status} />
              </div>

              <dl className="mt-3 space-y-1 border-t border-border-muted pt-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Enviado em</dt>
                  <dd className="text-fg">
                    {formatDateTime(payment.createdAt)} às{" "}
                    {formatTime(payment.createdAt)}
                  </dd>
                </div>
                {payment.reviewedAt && (
                  <div className="flex justify-between">
                    <dt className="text-fg-muted">
                      {payment.status === "REJEITADO"
                        ? "Rejeitado em"
                        : "Aprovado em"}
                    </dt>
                    <dd className="text-fg">
                      {formatDateTime(payment.reviewedAt)} às{" "}
                      {formatTime(payment.reviewedAt)}
                    </dd>
                  </div>
                )}
              </dl>

              {payment.proofId && (
                <a
                  href={`/api/comprovantes/${payment.proofId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  Ver comprovante enviado
                </a>
              )}

              {payment.status === "REJEITADO" && payment.rejectionReason && (
                <p className="mt-3 rounded-control bg-danger-tint px-3 py-2 text-xs text-danger-tint-fg">
                  Motivo da rejeição: {payment.rejectionReason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
