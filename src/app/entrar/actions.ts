"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createClientSession } from "@/lib/auth/session";
import { isLockedOut, nextLockState } from "@/lib/auth/lockout";
import type { LoginFormState } from "@/lib/auth/form-state";

const loginSchema = z.object({
  docNumber: z.string().trim().min(1, "Informe o CPF ou CNPJ."),
  password: z.string().min(1, "Informe a senha."),
});

// Mensagem genérica de propósito: não revela se o CPF/CNPJ existe, se a
// senha está errada, ou se a conta está bloqueada por causa de outra pessoa
// tentando adivinhar a senha — evita dar pistas pra quem está atacando.
const INVALID_CREDENTIALS_MESSAGE = "CPF/CNPJ ou senha inválidos.";
const LOCKED_MESSAGE =
  "Conta temporariamente bloqueada por várias tentativas inválidas. Tente novamente em alguns minutos.";

export async function clientLoginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = loginSchema.safeParse({
    docNumber: formData.get("docNumber"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { docNumber, password } = parsed.data;

  const client = await prisma.client.findUnique({ where: { docNumber } });

  if (!client) {
    return { error: INVALID_CREDENTIALS_MESSAGE };
  }

  if (isLockedOut(client.lockedUntil)) {
    return { error: LOCKED_MESSAGE };
  }

  const passwordOk = await verifyPassword(password, client.passwordHash);

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
