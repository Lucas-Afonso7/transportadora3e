import { formatBRL, formatDateTime } from "@/lib/format";
import type { ClientPaymentHistoryItem } from "@/lib/data/client-dashboard";
import { PaymentStatusBadge } from "./StatusBadge";

const METHOD_LABEL: Record<ClientPaymentHistoryItem["method"], string> = {
  PIX: "Pix",
  DINHEIRO: "Dinheiro",
};

export function PaymentHistoryItem({
  payment,
}: {
  payment: ClientPaymentHistoryItem;
}) {
  return (
    <div className="rounded-card border border-ink-200 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-ink-900">
            {payment.serviceDescription}
          </p>
          <p className="mt-0.5 text-sm text-ink-500">
            {formatDateTime(payment.createdAt)} · {METHOD_LABEL[payment.method]}
          </p>
        </div>
        <PaymentStatusBadge status={payment.status} />
      </div>

      <div className="mt-3 flex items-baseline justify-between border-t border-ink-100 pt-3">
        <span className="text-sm text-ink-500">Valor</span>
        <span className="font-semibold text-ink-900">
          {formatBRL(payment.amount)}
        </span>
      </div>

      {payment.proofId && (
        <a
          href={`/api/comprovantes/${payment.proofId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
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
  );
}
