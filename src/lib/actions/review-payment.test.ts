import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { approvePayment, rejectPayment } from "./review-payment";

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

async function createPendingPayment(serviceId: number, clientId: number, amount: string) {
  return prisma.payment.create({
    data: {
      serviceId,
      clientId,
      amount,
      method: "DINHEIRO",
      status: "AGUARDANDO_VALIDACAO",
    },
  });
}

async function cleanupClient(clientId: number) {
  await prisma.auditLog.deleteMany({ where: { payment: { clientId } } });
  await prisma.payment.deleteMany({ where: { clientId } });
  await prisma.service.deleteMany({ where: { clientId } });
  await prisma.client.delete({ where: { id: clientId } });
}

async function createTestAdmin() {
  const admin = await prisma.admin.create({
    data: {
      username: uniqueDocNumber(), // só precisa ser único, formato não importa aqui
      name: "Vitest Admin",
      passwordHash: await hashPassword("SenhaTeste123"),
    },
  });
  return admin.id;
}

async function cleanupAdmin(adminId: number) {
  await prisma.admin.delete({ where: { id: adminId } });
}

describe("approvePayment", () => {
  let clientId: number;
  let serviceId: number;
  let adminId: number;

  beforeEach(async () => {
    const ids = await createClientWithService("1000.00");
    clientId = ids.clientId;
    serviceId = ids.serviceId;
    adminId = await createTestAdmin();
  });

  afterEach(async () => {
    await cleanupClient(clientId);
    await cleanupAdmin(adminId);
  });

  it("aprova pagamento pendente e grava audit log", async () => {
    const payment = await createPendingPayment(serviceId, clientId, "500.00");

    const outcome = await approvePayment(payment.id, adminId);
    expect(outcome).toBe("ok");

    const updated = await prisma.payment.findUnique({ where: { id: payment.id } });
    expect(updated?.status).toBe("APROVADO");
    expect(updated?.reviewedByAdminId).toBe(adminId);
    expect(updated?.reviewedAt).not.toBeNull();

    const logs = await prisma.auditLog.findMany({ where: { paymentId: payment.id } });
    expect(logs).toHaveLength(1);
    expect(logs[0].action).toBe("APROVADO");
    expect(logs[0].actorType).toBe("ADMIN");
    expect(logs[0].actorAdminId).toBe(adminId);
    expect(logs[0].statusBefore).toBe("AGUARDANDO_VALIDACAO");
    expect(logs[0].statusAfter).toBe("APROVADO");
  });

  it("bloqueia dupla aprovação do mesmo pagamento", async () => {
    const payment = await createPendingPayment(serviceId, clientId, "500.00");

    const first = await approvePayment(payment.id, adminId);
    const second = await approvePayment(payment.id, adminId);

    expect(first).toBe("ok");
    expect(second).toBe("ja_revisado");

    // só um audit log deve existir, não dois
    const logs = await prisma.auditLog.findMany({ where: { paymentId: payment.id } });
    expect(logs).toHaveLength(1);
  });

  it("bloqueia aprovação que faria o total pago passar do valor do serviço", async () => {
    // serviço de 1000; dois pagamentos pendentes de 600 cada (cada um era
    // válido na hora do envio, mas não podem ser os dois aprovados)
    const paymentA = await createPendingPayment(serviceId, clientId, "600.00");
    const paymentB = await createPendingPayment(serviceId, clientId, "600.00");

    const outcomeA = await approvePayment(paymentA.id, adminId);
    const outcomeB = await approvePayment(paymentB.id, adminId);

    expect(outcomeA).toBe("ok");
    expect(outcomeB).toBe("excede_total");

    const updatedB = await prisma.payment.findUnique({ where: { id: paymentB.id } });
    expect(updatedB?.status).toBe("AGUARDANDO_VALIDACAO"); // continua pendente, não foi alterado
  });

  it("retorna ja_revisado para pagamento inexistente", async () => {
    const outcome = await approvePayment(999999999, adminId);
    expect(outcome).toBe("ja_revisado");
  });
});

describe("rejectPayment", () => {
  let clientId: number;
  let serviceId: number;
  let adminId: number;

  beforeEach(async () => {
    const ids = await createClientWithService("1000.00");
    clientId = ids.clientId;
    serviceId = ids.serviceId;
    adminId = await createTestAdmin();
  });

  afterEach(async () => {
    await cleanupClient(clientId);
    await cleanupAdmin(adminId);
  });

  it("rejeita com motivo e grava audit log", async () => {
    const payment = await createPendingPayment(serviceId, clientId, "500.00");

    const outcome = await rejectPayment(payment.id, adminId, "Comprovante ilegível");
    expect(outcome).toBe("ok");

    const updated = await prisma.payment.findUnique({ where: { id: payment.id } });
    expect(updated?.status).toBe("REJEITADO");
    expect(updated?.rejectionReason).toBe("Comprovante ilegível");

    const logs = await prisma.auditLog.findMany({ where: { paymentId: payment.id } });
    expect(logs).toHaveLength(1);
    expect(logs[0].action).toBe("REJEITADO");
  });

  it("exige motivo não vazio (nem só espaços)", async () => {
    const payment = await createPendingPayment(serviceId, clientId, "500.00");

    const empty = await rejectPayment(payment.id, adminId, "");
    const onlySpaces = await rejectPayment(payment.id, adminId, "   ");

    expect(empty).toBe("motivo_obrigatorio");
    expect(onlySpaces).toBe("motivo_obrigatorio");

    const unchanged = await prisma.payment.findUnique({ where: { id: payment.id } });
    expect(unchanged?.status).toBe("AGUARDANDO_VALIDACAO");
  });

  it("rejeitar não bloqueia o cliente de tentar de novo (não conta no valor aprovado)", async () => {
    const payment = await createPendingPayment(serviceId, clientId, "500.00");
    await rejectPayment(payment.id, adminId, "Valor errado");

    // "falta pagar" do serviço é calculado só a partir de APROVADO, então
    // um pagamento rejeitado não deve contar como pago
    const service = await prisma.service.findUniqueOrThrow({
      where: { id: serviceId },
      include: { payments: { select: { amount: true, status: true } } },
    });
    const { computeRemainingAmount } = await import("@/lib/payments");
    const remaining = computeRemainingAmount(service.totalAmount, service.payments);
    expect(remaining.toString()).toBe("1000");
  });

  it("retorna ja_revisado ao tentar rejeitar pagamento já aprovado", async () => {
    const payment = await createPendingPayment(serviceId, clientId, "500.00");
    await approvePayment(payment.id, adminId);

    const outcome = await rejectPayment(payment.id, adminId, "Motivo qualquer");
    expect(outcome).toBe("ja_revisado");
  });
});
