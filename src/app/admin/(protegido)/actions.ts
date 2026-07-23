"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/session";
import { approvePayment, rejectPayment } from "@/lib/actions/review-payment";
import { notifyPaymentApproved } from "@/lib/push-server";

// Sem isso, os links de navegação (sempre visíveis no cabeçalho, e por
// isso sempre pré-carregados pelo Next) continuam mostrando a versão
// antiga da página até um reload manual — revalidatePath invalida esse
// cache de prefetch em todas as páginas de uma vez (admin e painel do
// cliente compartilham os mesmos dados de pagamento).
function revalidateEverything() {
  revalidatePath("/", "layout");
}

function parsePaymentId(formData: FormData): number | null {
  const raw = formData.get("paymentId");
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function approvePaymentAction(formData: FormData) {
  const admin = await requireAdminSession();
  const paymentId = parsePaymentId(formData);

  if (!paymentId) {
    redirect("/admin?erro=dados_invalidos");
  }

  const outcome = await approvePayment(paymentId, admin.id);

  if (outcome === "ja_revisado") redirect("/admin?erro=ja_revisado");
  if (outcome === "excede_total") redirect("/admin?erro=excede_total");

  // Depois da transação confirmada, nunca dentro dela — ver comentário em
  // notifyPaymentApproved. Falha no push não pode derrubar a aprovação.
  await notifyPaymentApproved(paymentId).catch((error) => {
    console.error("Falha ao notificar aprovação por push:", error);
  });

  revalidateEverything();
  redirect("/admin?sucesso=aprovado");
}

export async function rejectPaymentAction(formData: FormData) {
  const admin = await requireAdminSession();
  const paymentId = parsePaymentId(formData);
  const reasonRaw = formData.get("reason");
  const reason = typeof reasonRaw === "string" ? reasonRaw : "";

  if (!paymentId) {
    redirect("/admin?erro=dados_invalidos");
  }

  const outcome = await rejectPayment(paymentId, admin.id, reason);

  if (outcome === "motivo_obrigatorio") redirect("/admin?erro=dados_invalidos");
  if (outcome === "motivo_muito_longo") redirect("/admin?erro=motivo_muito_longo");
  if (outcome === "ja_revisado") redirect("/admin?erro=ja_revisado");
  revalidateEverything();
  redirect("/admin?sucesso=rejeitado");
}
