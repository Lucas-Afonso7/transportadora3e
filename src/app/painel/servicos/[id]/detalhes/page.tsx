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
        className="mb-4 inline-block text-sm text-ink-500 hover:text-ink-900"
      >
        ← Voltar
      </Link>

      <div className="rounded-card border border-ink-200 bg-white p-5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-ink-900">{service.description}</p>
            <p className="mt-1 text-sm text-ink-500">
              Solicitado em {formatDate(service.serviceDate)}
              {service.dueDate &&
                ` · vencimento em ${formatDate(service.dueDate)}`}
            </p>
          </div>
          <ServiceStatusBadge status={service.status} />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-ink-100 pt-4 text-sm">
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

        {service.status !== "PAGO" && (
          <Link
            href={`/painel/servicos/${service.id}`}
            className="mt-4 block rounded-control bg-brand-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand-700"
          >
            Pagar
          </Link>
        )}
      </div>

      <h2 className="mb-3 mt-6 text-base font-semibold text-ink-900">
        Histórico de pagamentos deste serviço
      </h2>

      {service.payments.length === 0 ? (
        <p className="text-sm text-ink-500">
          Nenhum pagamento enviado pra esse serviço ainda.
        </p>
      ) : (
        <div className="space-y-3">
          {service.payments.map((payment) => (
            <div
              key={payment.id}
              className="rounded-card border border-ink-200 bg-white p-4 shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink-900">
                    {formatBRL(payment.amount)}
                  </p>
                  <p className="text-sm text-ink-500">
                    {METHOD_LABEL[payment.method]}
                  </p>
                </div>
                <PaymentStatusBadge status={payment.status} />
              </div>

              <dl className="mt-3 space-y-1 border-t border-ink-100 pt-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-500">Enviado em</dt>
                  <dd className="text-ink-900">
                    {formatDateTime(payment.createdAt)} às{" "}
                    {formatTime(payment.createdAt)}
                  </dd>
                </div>
                {payment.reviewedAt && (
                  <div className="flex justify-between">
                    <dt className="text-ink-500">
                      {payment.status === "REJEITADO"
                        ? "Rejeitado em"
                        : "Aprovado em"}
                    </dt>
                    <dd className="text-ink-900">
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
                  className="mt-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Ver comprovante enviado
                </a>
              )}

              {payment.status === "REJEITADO" && payment.rejectionReason && (
                <p className="mt-3 rounded-control bg-danger-50 px-3 py-2 text-xs text-danger-700">
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
