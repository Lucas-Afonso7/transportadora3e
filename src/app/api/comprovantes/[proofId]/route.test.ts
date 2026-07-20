import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mesma técnica de session.test.ts: `cookies()` do Next só funciona dentro
// do request lifecycle real, então simulamos o cookie jar num Map. session.ts
// (usado por getClientSession/getAdminSession dentro da rota) continua real.
const cookieJar = vi.hoisted(() => new Map<string, string>());

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieJar.get(name);
      return value === undefined ? undefined : { name, value };
    },
    set: (name: string, value: string) => {
      cookieJar.set(name, value);
    },
    delete: (name: string) => {
      cookieJar.delete(name);
    },
  }),
}));

import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createAdminSession, createClientSession } from "@/lib/auth/session";
import { deleteProofFile, saveProofFile } from "@/lib/storage";
import { GET } from "./route";

// Esta rota é o único jeito de ler o arquivo de um comprovante, e existe
// fora de public/ exatamente pra poder checar quem está pedindo antes de
// devolver o arquivo. Se essa checagem regredir, um cliente passa a
// enxergar comprovante de outro só adivinhando o ID — por isso o teste
// cobre as quatro combinações (sem sessão, dono, outro cliente, admin).

function uniqueDocNumber() {
  return `VTEST${Date.now()}${Math.floor(Math.random() * 10000)}`.slice(0, 20);
}

async function createClientRow(name: string) {
  return prisma.client.create({
    data: {
      docNumber: uniqueDocNumber(),
      name,
      phone: "31900000000",
      passwordHash: await hashPassword("SenhaTeste123"),
    },
  });
}

async function createClientWithProof() {
  const client = await createClientRow("Vitest Cliente");

  const service = await prisma.service.create({
    data: {
      clientId: client.id,
      description: "Serviço de teste (vitest)",
      totalAmount: "500.00",
      serviceDate: new Date("2026-01-01"),
    },
  });

  const payment = await prisma.payment.create({
    data: {
      serviceId: service.id,
      clientId: client.id,
      amount: "500.00",
      method: "PIX",
      status: "AGUARDANDO_VALIDACAO",
    },
  });

  const storedFileName = await saveProofFile(
    Buffer.from("conteudo-fake"),
    "png",
  );
  const proof = await prisma.paymentProof.create({
    data: {
      paymentId: payment.id,
      filePath: storedFileName,
      originalFileName: "comprovante.png",
      mimeType: "image/png",
      fileSizeBytes: 13,
    },
  });

  return { clientId: client.id, proofId: proof.id, storedFileName };
}

async function cleanupClient(clientId: number, storedFileName: string) {
  await prisma.session.deleteMany({ where: { clientId } });
  await prisma.paymentProof.deleteMany({ where: { payment: { clientId } } });
  await prisma.payment.deleteMany({ where: { clientId } });
  await prisma.service.deleteMany({ where: { clientId } });
  await prisma.client.delete({ where: { id: clientId } });
  await deleteProofFile(storedFileName);
}

function callRoute(proofId: number | string) {
  return GET(undefined as unknown as NextRequest, {
    params: Promise.resolve({ proofId: String(proofId) }),
  });
}

describe("GET /api/comprovantes/[proofId]", () => {
  let clientId: number;
  let proofId: number;
  let storedFileName: string;

  beforeEach(async () => {
    cookieJar.clear();
    const created = await createClientWithProof();
    clientId = created.clientId;
    proofId = created.proofId;
    storedFileName = created.storedFileName;
  });

  afterEach(async () => {
    await cleanupClient(clientId, storedFileName);
  });

  it("sem sessão: 401", async () => {
    const res = await callRoute(proofId);
    expect(res.status).toBe(401);
  });

  it("dono do comprovante: 200 com o arquivo certo", async () => {
    await createClientSession(clientId);

    const res = await callRoute(proofId);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/png");

    const body = Buffer.from(await res.arrayBuffer());
    expect(body.toString()).toBe("conteudo-fake");
  });

  it("outro cliente tentando ver o comprovante: 403", async () => {
    const other = await createClientRow("Vitest Outro Cliente");
    await createClientSession(other.id);

    const res = await callRoute(proofId);
    expect(res.status).toBe(403);

    await prisma.session.deleteMany({ where: { clientId: other.id } });
    await prisma.client.delete({ where: { id: other.id } });
  });

  it("admin: 200 com o arquivo, mesmo não sendo dono", async () => {
    const admin = await prisma.admin.create({
      data: {
        username: uniqueDocNumber(),
        name: "Vitest Admin",
        passwordHash: await hashPassword("SenhaTeste123"),
      },
    });
    await createAdminSession(admin.id);

    const res = await callRoute(proofId);
    expect(res.status).toBe(200);

    await prisma.session.deleteMany({ where: { adminId: admin.id } });
    await prisma.admin.delete({ where: { id: admin.id } });
  });

  it("proofId de um comprovante inexistente: 404", async () => {
    await createClientSession(clientId);
    const res = await callRoute(999999999);
    expect(res.status).toBe(404);
  });

  it("proofId inválido (não numérico), mesmo sem sessão: 404 antes de checar auth", async () => {
    const res = await callRoute("abc");
    expect(res.status).toBe(404);
  });
});
