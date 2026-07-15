import { formatBRL, formatDate } from "@/lib/format";
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
    <div className="rounded-card border border-ink-200 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-ink-900">{item.clientName}</p>
          <p className="text-xs text-ink-500">{item.clientDocNumber}</p>
        </div>
        <span className="text-xs text-ink-500">
          {formatDate(item.createdAt)}
        </span>
      </div>

      <p className="mt-2 text-sm text-ink-700">{item.serviceDescription}</p>

      <div className="mt-2 flex items-baseline justify-between border-t border-ink-100 pt-2">
        <span className="text-sm text-ink-500">
          {METHOD_LABEL[item.method]}
        </span>
        <span className="font-semibold text-ink-900">
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
              className="max-h-56 w-full rounded-control border border-ink-200 object-contain"
            />
          </a>
        ) : (
          <a
            href={`/api/comprovantes/${item.proofId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
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
