"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createClientSession } from "@/lib/auth/session";
import { isLockedOut, nextLockState } from "@/lib/auth/lockout";
import { isRateLimited, getRequestIp } from "@/lib/auth/rate-limit";
import type { LoginFormState } from "@/lib/auth/form-state";

const loginSchema = z.object({
  // O campo mostra CPF/CNPJ com pontuação (máscara em src/lib/doc-number.ts),
  // mas o valor gravado em Client.docNumber é só dígitos — sem esse
  // transform, o lookup abaixo nunca bateria com o que está no banco.
  docNumber: z
    .string()
    .trim()
    .min(1, "Informe o CPF ou CNPJ.")
    .transform((value) => value.replace(/\D/g, "")),
  password: z.string().min(1, "Informe a senha."),
});

// Mensagem genérica de propósito: não revela se o CPF/CNPJ existe, se a
// senha está errada, ou se a conta está bloqueada por causa de outra pessoa
// tentando adivinhar a senha — evita dar pistas pra quem está atacando.
const INVALID_CREDENTIALS_MESSAGE = "CPF/CNPJ ou senha inválidos.";
const LOCKED_MESSAGE =
  "Conta temporariamente bloqueada por várias tentativas inválidas. Tente novamente em alguns minutos.";
const RATE_LIMITED_MESSAGE =
  "Muitas tentativas de login. Tente novamente em alguns minutos.";

export async function clientLoginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const ip = await getRequestIp();
  if (await isRateLimited(`client:${ip}`)) {
    return { error: RATE_LIMITED_MESSAGE };
  }

  const parsed = loginSchema.safeParse({
    docNumber: formData.get("docNumber"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { docNumber, password } = parsed.data;

  // select explícito: só os campos que essa função de fato usa. Sem
  // isso, o Prisma traz a linha inteira (nome, telefone, e-mail...) pra
  // memória do servidor à toa — nunca vazou pro navegador (só campos
  // escolhidos a dedo chegam a ser retornados por essa action), mas
  // depender de "sempre lembrar de nunca devolver o objeto inteiro" é
  // frágil; um select na query elimina essa classe de erro de vez.
  const client = await prisma.client.findUnique({
    where: { docNumber },
    select: {
      id: true,
      passwordHash: true,
      failedLoginAttempts: true,
      lockedUntil: true,
    },
  });

  // Roda o bcrypt.compare ANTES de checar se a conta existe/está
  // bloqueada — client?.passwordHash é undefined quando não existe, e
  // verifyPassword trata isso comparando contra um hash fixo (ver
  // password.ts). Sem isso, "CPF não cadastrado" respondia na hora
  // enquanto "CPF cadastrado, senha errada" demorava o custo do bcrypt —
  // dava pra descobrir se um CPF existe só pelo tempo de resposta, mesmo
  // com mensagem de erro idêntica.
  const passwordOk = await verifyPassword(
    password,
    client?.passwordHash ?? null,
  );

  if (!client) {
    return { error: INVALID_CREDENTIALS_MESSAGE };
  }

  if (isLockedOut(client.lockedUntil)) {
    return { error: LOCKED_MESSAGE };
  }

  if (!passwordOk) {
    const { failedLoginAttempts, lockedUntil } = nextLockState(
      client.failedLoginAttempts,
    );
    await prisma.client.update({
      where: { id: client.id },
      data: { failedLoginAttempts, lockedUntil },
    });
    return {
      error: lockedUntil ? LOCKED_MESSAGE : INVALID_CREDENTIALS_MESSAGE,
    };
  }

  await prisma.client.update({
    where: { id: client.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });

  await createClientSession(client.id);
  redirect("/painel");
}
