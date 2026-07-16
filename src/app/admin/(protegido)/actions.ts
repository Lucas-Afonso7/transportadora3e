"use server";

import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/session";
import { approvePayment, rejectPayment } from "@/lib/actions/review-payment";

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
  if (outcome === "ja_revisado") redirect("/admin?erro=ja_revisado");
  redirect("/admin?sucesso=rejeitado");
}
