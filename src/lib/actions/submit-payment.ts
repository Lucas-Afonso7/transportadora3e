import "server-only";

import { prisma } from "@/lib/prisma";
import { computeRemainingAmount } from "@/lib/payments";
import {
  ALLOWED_PROOF_MIME_TYPES,
  MAX_PROOF_SIZE_BYTES,
  isAllowedProofMimeType,
} from "@/lib/uploads";
import { detectFileSignature } from "@/lib/file-signature";
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

  // Se já existe algum pagamento rejeitado nesse serviço, esse envio é
  // um reenvio — o cliente tentando de novo depois de ter sido barrado
  // — não uma tentativa "do zero". O audit log distingue os dois casos
  // (ação REENVIADO em vez de CRIADO) pro admin entender o histórico
  // sem precisar cruzar isso manualmente.
  const isResubmission = service.payments.some(
    (payment) => payment.status === "REJEITADO",
  );

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

    const buffer = Buffer.from(await file.arrayBuffer());

    // `file.type` (o que o navegador reporta) nunca decide se o arquivo
    // é permitido — só o que os bytes de verdade dizem que ele é. Um
    // .html renomeado pra "comprovante.png" com type "image/png" é
    // barrado aqui, mesmo passando por qualquer checagem baseada só no
    // nome/type declarado.
    const detectedType = detectFileSignature(buffer);
    if (!detectedType || !isAllowedProofMimeType(detectedType)) {
      return {
        ok: false,
        error: "Envie o comprovante em imagem (JPG/PNG/WEBP) ou PDF.",
      };
    }

    const extension = ALLOWED_PROOF_MIME_TYPES[detectedType];

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
            // Tipo detectado pelo conteúdo real, não o `file.type`
            // declarado pelo navegador — é o que a rota de download usa
            // no Content-Type da resposta, então também não pode vir de
            // um campo que o cliente controla.
            mimeType: detectedType,
            fileSizeBytes: file.size,
          },
        });

        await tx.auditLog.create({
          data: {
            paymentId: payment.id,
            actorType: "CLIENT",
            action: isResubmission ? "REENVIADO" : "CRIADO",
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
          action: isResubmission ? "REENVIADO" : "CRIADO",
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
