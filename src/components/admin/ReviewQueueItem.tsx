import { formatBRL, formatDateTime } from "@/lib/format";
import type { ReviewQueueItem as ReviewQueueItemType } from "@/lib/data/admin-review-queue";
import { approvePaymentAction } from "@/app/admin/(protegido)/actions";
import { RejectButton } from "./RejectButton";

const METHOD_LABEL: Record<ReviewQueueItemType["method"], string> = {
  PIX: "Pix",
  DINHEIRO: "Dinheiro",
};

export function ReviewQueueItem({ item }: { item: ReviewQueueItemType }) {
  const isImage = item.proofMimeType?.startsWith("image/") ?? false;

  return (
    <div className="rounded-card border border-border bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-fg">{item.clientName}</p>
          <p className="text-xs text-fg-muted">{item.clientDocNumber}</p>
        </div>
        <span className="text-xs text-fg-muted">
          {formatDateTime(item.createdAt)}
        </span>
      </div>

      <p className="mt-2 text-sm text-fg-muted">{item.serviceDescription}</p>

      <div className="mt-2 flex items-baseline justify-between border-t border-border-muted pt-2">
        <span className="text-sm text-fg-muted">
          {METHOD_LABEL[item.method]}
        </span>
        <span className="font-semibold text-fg">
          {formatBRL(item.amount)}
        </span>
      </div>

      {item.proofId &&
        (isImage ? (
          <a
            href={`/api/comprovantes/${item.proofId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- imagem vem de rota autenticada dinâmica, não de asset estático */}
            <img
              src={`/api/comprovantes/${item.proofId}`}
              alt={`Comprovante de ${item.clientName}`}
              className="max-h-56 w-full rounded-control border border-border object-contain"
            />
          </a>
        ) : (
          <a
            href={`/api/comprovantes/${item.proofId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Abrir comprovante (PDF)
          </a>
        ))}

      <div className="mt-4 flex flex-wrap items-start gap-2">
        <form action={approvePaymentAction}>
          <input type="hidden" name="paymentId" value={item.paymentId} />
          <button
            type="submit"
            className="rounded-control bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Aprovar
          </button>
        </form>
        <RejectButton paymentId={item.paymentId} />
      </div>
    </div>
  );
}
