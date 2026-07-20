import { requireAdminSession } from "@/lib/auth/session";
import { getPendingReviewQueue } from "@/lib/data/admin-review-queue";
import { ReviewQueueItem } from "@/components/admin/ReviewQueueItem";

const ERROR_MESSAGES: Record<string, string> = {
  dados_invalidos: "Dados inválidos.",
  ja_revisado: "Esse comprovante já tinha sido revisado (por outra aba ou outro admin).",
  excede_total:
    "Aprovar esse valor faria o total pago passar do valor do serviço. Rejeite ou confira os outros pagamentos pendentes desse mesmo serviço antes.",
};

const SUCCESS_MESSAGES: Record<string, string> = {
  aprovado: "Pagamento aprovado.",
  rejeitado: "Pagamento rejeitado — o cliente já pode ver o motivo e reenviar.",
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ sucesso?: string; erro?: string }>;
}) {
  const admin = await requireAdminSession();
  const { sucesso, erro } = await searchParams;
  const queue = await getPendingReviewQueue();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-fg">
          Olá, {admin.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-fg-muted">
          Comprovantes aguardando sua validação.
        </p>
      </div>

      {sucesso && SUCCESS_MESSAGES[sucesso] && (
        <p className="rounded-control bg-brand-tint px-4 py-3 text-sm font-medium text-brand-tint-fg">
          {SUCCESS_MESSAGES[sucesso]}
        </p>
      )}
      {erro && (
        <p className="rounded-control bg-danger-tint px-4 py-3 text-sm font-medium text-danger-tint-fg">
          {ERROR_MESSAGES[erro] ?? "Não foi possível concluir a ação."}
        </p>
      )}

      <div
        className={`rounded-card border p-5 shadow-card ${
          queue.length > 0
            ? "border-warning-500 bg-warning-tint"
            : "border-border bg-surface"
        }`}
      >
        <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
          Pendentes de validação
        </p>
        <p
          className={`mt-1 text-4xl font-semibold ${
            queue.length > 0 ? "text-warning-tint-fg" : "text-fg"
          }`}
        >
          {queue.length}
        </p>
      </div>

      {queue.length === 0 ? (
        <p className="text-sm text-fg-muted">
          Nenhum comprovante pendente no momento. Tudo em dia.
        </p>
      ) : (
        // Grid a partir de telas médias: essa é a tela mais usada no dia a
        // dia, num PC com espaço de sobra — empilhar em coluna única (como
        // no mobile) obrigaria a rolar muito mais pra revisar a fila.
        <div className="grid gap-3 md:grid-cols-2">
          {queue.map((item) => (
            <ReviewQueueItem key={item.paymentId} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
