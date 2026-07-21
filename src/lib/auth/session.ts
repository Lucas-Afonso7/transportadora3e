import "server-only";

import { randomBytes, createHash } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

const CLIENT_COOKIE = "t3e_client_session";
const ADMIN_COOKIE = "t3e_admin_session";

function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

// Só o hash do token fica no banco — igual senha. Se o banco vazar, ninguém
// consegue montar um cookie de sessão válido a partir do hash sozinho.
function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Apaga sessões já expiradas — nenhuma delas autentica mais ninguém
// (readSession já rejeita pelo expiresAt), então isso é só limpeza de
// linha morta, nunca urgente. Separada da probabilidade de disparo
// (abaixo) pra poder testar a exclusão em si sem depender de sorte no
// Math.random().
export async function sweepExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return result.count;
}

// 1% de chance a cada sessão criada — mesmo padrão já usado pro rate
// limit em memória antes da troca pro Redis. Sem cron nem endpoint
// dedicado: sessão é criada toda vez que alguém loga, e login acontece
// com frequência suficiente pra isso não deixar a tabela crescer sem
// limite, sem precisar de infra extra pro tamanho desse app.
async function maybeSweepExpiredSessions() {
  if (Math.random() < 0.01) {
    await sweepExpiredSessions();
  }
}

async function createSession(
  actorType: "CLIENT" | "ADMIN",
  actorId: number,
  cookieName: string,
) {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: {
      tokenHash: hashSessionToken(token),
      actorType,
      clientId: actorType === "CLIENT" ? actorId : undefined,
      adminId: actorType === "ADMIN" ? actorId : undefined,
      expiresAt,
    },
  });

  await maybeSweepExpiredSessions();

  const cookieStore = await cookies();
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

async function destroySession(actorType: "CLIENT" | "ADMIN", cookieName: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashSessionToken(token), actorType },
    });
  }

  cookieStore.delete(cookieName);
}

export function createClientSession(clientId: number) {
  return createSession("CLIENT", clientId, CLIENT_COOKIE);
}

export function createAdminSession(adminId: number) {
  return createSession("ADMIN", adminId, ADMIN_COOKIE);
}

export function destroyClientSession() {
  return destroySession("CLIENT", CLIENT_COOKIE);
}

export function destroyAdminSession() {
  return destroySession("ADMIN", ADMIN_COOKIE);
}

export type SafeClient = {
  id: number;
  docNumber: string;
  name: string;
  phone: string;
  email: string | null;
};

export type SafeAdmin = {
  id: number;
  username: string;
  name: string;
};

async function readSession(actorType: "CLIENT" | "ADMIN", cookieName: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
  });

  if (!session || session.actorType !== actorType || session.expiresAt < new Date()) {
    return null;
  }

  return session;
}

export async function getClientSession(): Promise<SafeClient | null> {
  const session = await readSession("CLIENT", CLIENT_COOKIE);
  if (!session?.clientId) return null;

  const client = await prisma.client.findUnique({
    where: { id: session.clientId },
    select: { id: true, docNumber: true, name: true, phone: true, email: true },
  });

  return client;
}

export async function getAdminSession(): Promise<SafeAdmin | null> {
  const session = await readSession("ADMIN", ADMIN_COOKIE);
  if (!session?.adminId) return null;

  const admin = await prisma.admin.findUnique({
    where: { id: session.adminId },
    select: { id: true, username: true, name: true },
  });

  return admin;
}

export async function requireClientSession(): Promise<SafeClient> {
  const client = await getClientSession();
  if (!client) redirect("/entrar");
  return client;
}

export async function requireAdminSession(): Promise<SafeAdmin> {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/entrar");
  return admin;
}
