import "server-only";

import { prisma } from "@/lib/prisma";
import { computeRemainingAmount } from "@/lib/payments";
import {
  ALLOWED_PROOF_MIME_TYPES,
  MAX_PROOF_SIZE_BYTES,
  isAllowedProofMimeType,
} from "@/lib/uploads";
import { saveProofFile, deleteProofFile } from "@/lib/storage";
import { formatBRL } from "@/lib/format";
import { parseAmountInput } from "@/lib/money";

export type SubmitPaymentInput = {
  clientId: number;
  serviceId: number;
  method: "PIX" | "DINHEIRO";
  amountRaw: unknown;
  proofFile: File | null;
};

export type SubmitPaymentResult =
  | { ok: true; paymentId: number }
  | { ok: false; error: string };

// Núcleo do fluxo de pagamento (Etapa 5), separado da Server Action pra
// poder ser testado direto contra o banco (vitest) sem precisar simular
// cookies/sessão/FormData do Next.js — só a regra de negócio em si.
export async function submitPayment(
  input: SubmitPaymentInput,
): Promise<SubmitPaymentResult> {
  const amount = parseAmountInput(input.amountRaw);
  if (!amount) {
    return {
      ok: false,
      error:
        "Informe um valor válido, maior que zero e com no máximo 2 casas decimais.",
    };
  }

  // O serviço só é encontrado se pertencer ao cliente informado — um
  // serviço inexistente e um serviço de outro cliente retornam exatamente
  // o mesmo erro, então não dá pra usar essa mensagem pra descobrir se um
  // ID de serviço alheio existe.
  const service = await prisma.service.findFirst({
    where: { id: input.serviceId, clientId: input.clientId },
    include: { payments: { select: { amount: true, status: true } } },
  });

  if (!service) {
    return { ok: false, error: "Serviço não encontrado." };
  }

  const remaining = computeRemainingAmount(
    service.totalAmount,
    service.payments,
  );

  if (amount.gt(remaining)) {
    return {
      ok: false,
      error: `O valor não pode passar de ${formatBRL(remaining)}, que é o que falta pagar deste serviço.`,
    };
  }

  if (input.method === "PIX") {
    const file = input.proofFile;

    if (!file || file.size === 0) {
      return { ok: false, error: "Anexe o comprovante do Pix." };
    }

    if (file.size > MAX_PROOF_SIZE_BYTES) {
      return {
        ok: false,
        error: "O arquivo do comprovante deve ter no máximo 8MB.",
      };
    }

    if (!isAllowedProofMimeType(file.type)) {
      return {
        ok: false,
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
      const paymentId = await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            serviceId: service.id,
            clientId: input.clientId,
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

        return payment.id;
      });

      return { ok: true, paymentId };
    } catch (err) {
      // 2) Se o banco falhar depois do arquivo já gravado, desfaz o
      //    arquivo — evita órfão E evita o cliente achar que enviou algo
      //    que na verdade não foi registrado.
      await deleteProofFile(storedFileName);
      console.error("Erro ao registrar pagamento PIX:", err);
      return {
        ok: false,
        error: "Não foi possível registrar o pagamento. Tente novamente.",
      };
    }
  }

  try {
    const paymentId = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          serviceId: service.id,
          clientId: input.clientId,
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

      return payment.id;
    });

    return { ok: true, paymentId };
  } catch (err) {
    console.error("Erro ao registrar pagamento em dinheiro:", err);
    return {
      ok: false,
      error: "Não foi possível registrar o pagamento. Tente novamente.",
    };
  }
}
