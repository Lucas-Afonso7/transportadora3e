import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// `cookies()` do Next só funciona dentro do request lifecycle de verdade;
// fora dele (vitest puro) precisamos simular o cookie jar que ela devolve.
// O estado fica num Map compartilhado só entre os testes deste arquivo, o
// que deixa create/get/destroy conversarem entre si exatamente como
// fariam numa request real.
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

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import {
  createAdminSession,
  createClientSession,
  destroyAdminSession,
  destroyClientSession,
  getAdminSession,
  getClientSession,
  sweepExpiredSessions,
} from "./session";

// Nomes reais definidos em session.ts — não exportados, então fixados aqui
// de propósito: se um dia mudarem, o teste de isolamento por actorType
// (mais abaixo) precisa ser revisto junto.
const CLIENT_COOKIE = "t3e_client_session";
const ADMIN_COOKIE = "t3e_admin_session";

function uniqueDocNumber() {
  return `VTEST${Date.now()}${Math.floor(Math.random() * 10000)}`.slice(0, 20);
}

async function createTestClient() {
  return prisma.client.create({
    data: {
      docNumber: uniqueDocNumber(),
      name: "Vitest Cliente",
      phone: "31900000000",
      passwordHash: await hashPassword("SenhaTeste123"),
    },
  });
}

async function createTestAdmin() {
  return prisma.admin.create({
    data: {
      username: uniqueDocNumber(),
      name: "Vitest Admin",
      passwordHash: await hashPassword("SenhaTeste123"),
    },
  });
}

describe("session", () => {
  let clientId: number;
  let adminId: number;

  beforeEach(async () => {
    cookieJar.clear();
    const [client, admin] = await Promise.all([
      createTestClient(),
      createTestAdmin(),
    ]);
    clientId = client.id;
    adminId = admin.id;
  });

  afterEach(async () => {
    await prisma.session.deleteMany({
      where: { OR: [{ clientId }, { adminId }] },
    });
    await prisma.client.delete({ where: { id: clientId } });
    await prisma.admin.delete({ where: { id: adminId } });
  });

  it("createClientSession + getClientSession: sessão criada é lida de volta", async () => {
    await createClientSession(clientId);
    const client = await getClientSession();
    expect(client?.id).toBe(clientId);
  });

  it("createAdminSession + getAdminSession: sessão criada é lida de volta", async () => {
    await createAdminSession(adminId);
    const admin = await getAdminSession();
    expect(admin?.id).toBe(adminId);
  });

  it("sem cookie: getClientSession/getAdminSession retornam null", async () => {
    expect(await getClientSession()).toBeNull();
    expect(await getAdminSession()).toBeNull();
  });

  it("cookie com token que não existe no banco: retorna null", async () => {
    cookieJar.set(CLIENT_COOKIE, "token-que-nunca-foi-emitido");
    expect(await getClientSession()).toBeNull();
  });

  it("sessão expirada não autentica mesmo com cookie válido", async () => {
    await createClientSession(clientId);

    const session = await prisma.session.findFirstOrThrow({
      where: { clientId },
    });
    await prisma.session.update({
      where: { id: session.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    expect(await getClientSession()).toBeNull();
  });

  it("token de sessão de cliente não autentica como admin (isolamento por actorType)", async () => {
    await createClientSession(clientId);
    const clientToken = cookieJar.get(CLIENT_COOKIE);
    expect(clientToken).toBeDefined();

    // Simula alguém colando o token de sessão de cliente no cookie de
    // admin — mesmo hash existindo na tabela sessions, actorType não bate.
    cookieJar.set(ADMIN_COOKIE, clientToken!);

    expect(await getAdminSession()).toBeNull();
  });

  it("destroyClientSession apaga a linha no banco e o cookie", async () => {
    await createClientSession(clientId);
    expect(await prisma.session.count({ where: { clientId } })).toBe(1);

    await destroyClientSession();

    expect(await prisma.session.count({ where: { clientId } })).toBe(0);
    expect(cookieJar.has(CLIENT_COOKIE)).toBe(false);
    expect(await getClientSession()).toBeNull();
  });

  it("destroyAdminSession não afeta uma sessão de cliente ativa ao mesmo tempo", async () => {
    await createClientSession(clientId);
    await createAdminSession(adminId);

    await destroyAdminSession();

    expect(await getAdminSession()).toBeNull();
    expect((await getClientSession())?.id).toBe(clientId);
  });

  it("sweepExpiredSessions apaga só as sessões já expiradas, preserva as válidas", async () => {
    await createClientSession(clientId);
    await createAdminSession(adminId);

    const clientSession = await prisma.session.findFirstOrThrow({
      where: { clientId },
    });
    await prisma.session.update({
      where: { id: clientSession.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    // sessão do admin continua válida (expiresAt no futuro, como
    // createAdminSession já deixou)

    const deletedCount = await sweepExpiredSessions();

    expect(deletedCount).toBeGreaterThanOrEqual(1);
    expect(await prisma.session.count({ where: { clientId } })).toBe(0);
    expect(await prisma.session.count({ where: { adminId } })).toBe(1);
  });
});
