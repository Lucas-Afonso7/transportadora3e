import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { deleteProofFile } from "@/lib/storage";
import { submitPayment } from "./submit-payment";

// Testes de integração de verdade: rodam contra o MySQL real (mesmo banco
// do dev), não um mock. Cada teste cria seu próprio cliente/serviço com
// doc_number único e limpa tudo (linhas + arquivo em disco, se houver) no
// afterEach — não deixa rastro no banco entre execuções.

function uniqueDocNumber() {
  return `VTEST${Date.now()}${Math.floor(Math.random() * 10000)}`.slice(0, 20);
}

async function createClientWithService(totalAmount: string) {
  const client = await prisma.client.create({
    data: {
      docNumber: uniqueDocNumber(),
      name: "Vitest Cliente",
      phone: "31900000000",
      passwordHash: await hashPassword("SenhaTeste123"),
    },
  });
  const service = await prisma.service.create({
    data: {
      clientId: client.id,
      description: "Serviço de teste (vitest)",
      totalAmount,
      serviceDate: new Date("2026-01-01"),
    },
  });
  return { clientId: client.id, serviceId: service.id };
}

async function cleanupClient(clientId: number) {
  const proofs = await prisma.paymentProof.findMany({
    where: { payment: { clientId } },
    select: { filePath: true },
  });
  await prisma.auditLog.deleteMany({ where: { payment: { clientId } } });
  await prisma.paymentProof.deleteMany({ where: { payment: { clientId } } });
  await prisma.payment.deleteMany({ where: { clientId } });
  await prisma.service.deleteMany({ where: { clientId } });
  await prisma.client.delete({ where: { id: clientId } });

  for (const proof of proofs) {
    await deleteProofFile(proof.filePath);
  }
}

describe("submitPayment", () => {
  let clientId: number;
  let serviceId: number;

  beforeEach(async () => {
    const ids = await createClientWithService("1000.00");
    clientId = ids.clientId;
    serviceId = ids.serviceId;
  });

  afterEach(async () => {
    await cleanupClient(clientId);
  });

  it("registra pagamento em dinheiro válido como AGUARDANDO_VALIDACAO", async () => {
    const result = await submitPayment({
      clientId,
      serviceId,
      method: "DINHEIRO",
      amountRaw: "500.00",
      proofFile: null,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const payment = await prisma.payment.findUnique({
      where: { id: result.paymentId },
    });
    expect(payment?.status).toBe("AGUARDANDO_VALIDACAO");
    expect(payment?.amount.toString()).toBe("500");
    expect(payment?.method).toBe("DINHEIRO");

    const auditLogs = await prisma.auditLog.findMany({
      where: { paymentId: result.paymentId },
    });
    expect(auditLogs).toHaveLength(1);
    expect(auditLogs[0].action).toBe("CRIADO");
    expect(auditLogs[0].actorType).toBe("CLIENT");
  });

  it("rejeita valor acima do que falta pagar", async () => {
    const result = await submitPayment({
      clientId,
      serviceId,
      method: "DINHEIRO",
      amountRaw: "99999.00",
      proofFile: null,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/não pode passar/);
  });

  it("rejeita valor com mais de 2 casas decimais", async () => {
    const result = await submitPayment({
      clientId,
      serviceId,
      method: "DINHEIRO",
      amountRaw: "100.123",
      proofFile: null,
    });

    expect(result.ok).toBe(false);
  });

  it("rejeita valor zero ou negativo", async () => {
    const zero = await submitPayment({
      clientId,
      serviceId,
      method: "DINHEIRO",
      amountRaw: "0",
      proofFile: null,
    });
    expect(zero.ok).toBe(false);

    const negative = await submitPayment({
      clientId,
      serviceId,
      method: "DINHEIRO",
      amountRaw: "-50",
      proofFile: null,
    });
    expect(negative.ok).toBe(false);
  });

  it("isolamento: um cliente não paga serviço de outro", async () => {
    const other = await createClientWithService("500.00");

    const result = await submitPayment({
      clientId: other.clientId,
      serviceId, // serviço pertence ao clientId original, não ao "other"
      method: "DINHEIRO",
      amountRaw: "100.00",
      proofFile: null,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Serviço não encontrado.");

    await cleanupClient(other.clientId);
  });

  it("PIX sem arquivo é rejeitado", async () => {
    const result = await submitPayment({
      clientId,
      serviceId,
      method: "PIX",
      amountRaw: "500.00",
      proofFile: null,
    });

    expect(result.ok).toBe(false);
  });

  it("PIX com tipo de arquivo não permitido é rejeitado", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "arquivo.txt", {
      type: "text/plain",
    });

    const result = await submitPayment({
      clientId,
      serviceId,
      method: "PIX",
      amountRaw: "100.00",
      proofFile: file,
    });

    expect(result.ok).toBe(false);
  });

  it("PIX com arquivo cujo conteúdo real não bate com o type declarado é rejeitado", async () => {
    // `type` diz "image/png", mas o conteúdo de verdade é HTML — exatamente
    // o cenário que a checagem por magic bytes existe pra barrar (um
    // arquivo malicioso renomeado/com type falsificado não passa só
    // porque o navegador reportou um Content-Type "de boa fé").
    const fakeBytes = new TextEncoder().encode(
      "<html><script>alert(1)</script></html>",
    );
    const file = new File([fakeBytes], "comprovante.png", {
      type: "image/png",
    });

    const result = await submitPayment({
      clientId,
      serviceId,
      method: "PIX",
      amountRaw: "100.00",
      proofFile: file,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/imagem.*ou PDF/);
    }
  });

  it("PIX com arquivo grande demais (>8MB) é rejeitado", async () => {
    const bigBuffer = new Uint8Array(9 * 1024 * 1024);
    const file = new File([bigBuffer], "grande.png", { type: "image/png" });

    const result = await submitPayment({
      clientId,
      serviceId,
      method: "PIX",
      amountRaw: "100.00",
      proofFile: file,
    });

    expect(result.ok).toBe(false);
  });

  it("PIX com arquivo válido cria Payment + PaymentProof + AuditLog juntos", async () => {
    // Assinatura real de PNG (8 bytes) — precisa ser conteúdo de verdade
    // agora que a validação checa os magic bytes, não só o `type`
    // declarado no File.
    const pngSignature = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    const file = new File([pngSignature], "comprovante.png", {
      type: "image/png",
    });

    const result = await submitPayment({
      clientId,
      serviceId,
      method: "PIX",
      amountRaw: "300.00",
      proofFile: file,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const proof = await prisma.paymentProof.findUnique({
      where: { paymentId: result.paymentId },
    });
    expect(proof).not.toBeNull();
    expect(proof?.mimeType).toBe("image/png");
    expect(proof?.fileSizeBytes).toBe(pngSignature.length);

    const auditLogs = await prisma.auditLog.findMany({
      where: { paymentId: result.paymentId },
    });
    expect(auditLogs).toHaveLength(1);
  });

  it("com um pagamento rejeitado antes no mesmo serviço, o próximo envio vira REENVIADO no audit log", async () => {
    await prisma.payment.create({
      data: {
        serviceId,
        clientId,
        amount: "200.00",
        method: "DINHEIRO",
        status: "REJEITADO",
        rejectionReason: "Comprovante ilegível",
      },
    });

    const result = await submitPayment({
      clientId,
      serviceId,
      method: "DINHEIRO",
      amountRaw: "200.00",
      proofFile: null,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const auditLogs = await prisma.auditLog.findMany({
      where: { paymentId: result.paymentId },
    });
    expect(auditLogs).toHaveLength(1);
    expect(auditLogs[0].action).toBe("REENVIADO");
  });
});
