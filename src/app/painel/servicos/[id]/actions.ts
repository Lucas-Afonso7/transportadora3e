"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireClientSession } from "@/lib/auth/session";
import { computeRemainingAmount } from "@/lib/payments";
import {
  ALLOWED_PROOF_MIME_TYPES,
  MAX_PROOF_SIZE_BYTES,
  isAllowedProofMimeType,
} from "@/lib/uploads";
import { saveProofFile, deleteProofFile } from "@/lib/storage";
import { formatBRL } from "@/lib/format";
import { parseAmountInput } from "@/lib/money";

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

  const { serviceId, method } = parsed.data;

  const amount = parseAmountInput(formData.get("amount"));
  if (!amount) {
    return {
      error:
        "Informe um valor válido, maior que zero e com no máximo 2 casas decimais.",
    };
  }

  // O serviço só é encontrado se pertencer ao cliente da sessão — um
  // serviço inexistente e um serviço de outro cliente retornam exatamente
  // o mesmo erro, então não dá pra usar essa mensagem pra descobrir se um
  // ID de serviço alheio existe.
  const service = await prisma.service.findFirst({
    where: { id: serviceId, clientId: client.id },
    include: { payments: { select: { amount: true, status: true } } },
  });

  if (!service) {
    return { error: "Serviço não encontrado." };
  }

  const remaining = computeRemainingAmount(service.totalAmount, service.payments);

  if (amount.gt(remaining)) {
    return {
      error: `O valor não pode passar de ${formatBRL(remaining)}, que é o que falta pagar deste serviço.`,
    };
  }

  if (method === "PIX") {
    const file = formData.get("comprovante");

    if (!(file instanceof File) || file.size === 0) {
      return { error: "Anexe o comprovante do Pix." };
    }

    if (file.size > MAX_PROOF_SIZE_BYTES) {
      return { error: "O arquivo do comprovante deve ter no máximo 8MB." };
    }

    if (!isAllowedProofMimeType(file.type)) {
      return {
        error: "Envie o comprovante em imagem (JPG/PNG/WEBP) ou PDF.",
      };
    }

    const extension = ALLOWED_PROOF_MIME_TYPES[file.type];
    const buffer = Buffer.from(await file.arrayBuffer());

    // 1) Grava o arquivo em disco primeiro. Só se isso funcionar é que
    //    tocamos no banco — assim nunca existe um Payment sem comprovante
    //    correspondente de fato salvo.
    const storedFileName = await saveProofFile(buffer, extension);

    try {
      await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            serviceId: service.id,
            clientId: client.id,
            amount,
            method: "PIX",
            status: "AGUARDANDO_VALIDACAO",
          },
        });

        await tx.paymentProof.create({
          data: {
            paymentId: payment.id,
            filePath: storedFileName,
            originalFileName: file.name,
            mimeType: file.type,
            fileSizeBytes: file.size,
          },
        });

        await tx.auditLog.create({
          data: {
            paymentId: payment.id,
            actorType: "CLIENT",
            action: "CRIADO",
            statusAfter: "AGUARDANDO_VALIDACAO",
            amountAfter: amount,
          },
        });
      });
    } catch (err) {
      // 2) Se o banco falhar depois do arquivo já gravado, desfaz o
      //    arquivo — evita órfão E evita o cliente achar que enviou algo
      //    que na verdade não foi registrado.
      await deleteProofFile(storedFileName);
      console.error("Erro ao registrar pagamento PIX:", err);
      return {
        error: "Não foi possível registrar o pagamento. Tente novamente.",
      };
    }
  } else {
    try {
      await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            serviceId: service.id,
            clientId: client.id,
            amount,
            method: "DINHEIRO",
            status: "AGUARDANDO_VALIDACAO",
          },
        });

        await tx.auditLog.create({
          data: {
            paymentId: payment.id,
            actorType: "CLIENT",
            action: "CRIADO",
            statusAfter: "AGUARDANDO_VALIDACAO",
            amountAfter: amount,
          },
        });
      });
    } catch (err) {
      console.error("Erro ao registrar pagamento em dinheiro:", err);
      return {
        error: "Não foi possível registrar o pagamento. Tente novamente.",
      };
    }
  }

  redirect("/painel?pagamento=enviado");
}
