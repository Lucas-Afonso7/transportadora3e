"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireClientSession } from "@/lib/auth/session";
import { submitPayment } from "@/lib/actions/submit-payment";

export type PaymentFormState = {
  error: string | null;
};

const idAndMethodSchema = z.object({
  serviceId: z.coerce.number().int().positive(),
  method: z.enum(["PIX", "DINHEIRO"]),
});

export async function submitPaymentAction(
  _prevState: PaymentFormState,
  formData: FormData,
): Promise<PaymentFormState> {
  const client = await requireClientSession();

  const parsed = idAndMethodSchema.safeParse({
    serviceId: formData.get("serviceId"),
    method: formData.get("method"),
  });

  if (!parsed.success) {
    return { error: "Requisição inválida." };
  }

  const file = formData.get("comprovante");

  const result = await submitPayment({
    clientId: client.id,
    serviceId: parsed.data.serviceId,
    method: parsed.data.method,
    amountRaw: formData.get("amount"),
    proofFile: file instanceof File ? file : null,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  // Sem isso, o link "Comprovantes"/nav do admin (sempre no cabeçalho, e
  // por isso sempre pré-carregado pelo Next) continua mostrando a fila
  // antiga até um reload manual — revalidatePath invalida esse cache de
  // prefetch em todas as páginas de uma vez.
  revalidatePath("/", "layout");
  redirect("/painel?pagamento=enviado");
}
