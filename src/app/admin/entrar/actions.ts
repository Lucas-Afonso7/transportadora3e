"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createAdminSession } from "@/lib/auth/session";
import { isLockedOut, nextLockState } from "@/lib/auth/lockout";
import { isRateLimited, getRequestIp } from "@/lib/auth/rate-limit";
import type { LoginFormState } from "@/lib/auth/form-state";

const loginSchema = z.object({
  username: z.string().trim().min(1, "Informe o usuário."),
  password: z.string().min(1, "Informe a senha."),
});

const INVALID_CREDENTIALS_MESSAGE = "Usuário ou senha inválidos.";
const LOCKED_MESSAGE =
  "Conta temporariamente bloqueada por várias tentativas inválidas. Tente novamente em alguns minutos.";
const RATE_LIMITED_MESSAGE =
  "Muitas tentativas de login. Tente novamente em alguns minutos.";

export async function adminLoginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const ip = await getRequestIp();
  if (await isRateLimited(`admin:${ip}`)) {
    return { error: RATE_LIMITED_MESSAGE };
  }

  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { username, password } = parsed.data;

  const admin = await prisma.admin.findUnique({ where: { username } });

  // Roda o bcrypt.compare ANTES de checar se a conta existe/está
  // bloqueada — mesmo motivo do login do cliente (ver comentário
  // equivalente em src/app/entrar/actions.ts): sem isso, dava pra
  // descobrir se um usuário de admin existe só pelo tempo de resposta.
  const passwordOk = await verifyPassword(
    password,
    admin?.passwordHash ?? null,
  );

  if (!admin) {
    return { error: INVALID_CREDENTIALS_MESSAGE };
  }

  if (isLockedOut(admin.lockedUntil)) {
    return { error: LOCKED_MESSAGE };
  }

  if (!passwordOk) {
    const { failedLoginAttempts, lockedUntil } = nextLockState(
      admin.failedLoginAttempts,
    );
    await prisma.admin.update({
      where: { id: admin.id },
      data: { failedLoginAttempts, lockedUntil },
    });
    return {
      error: lockedUntil ? LOCKED_MESSAGE : INVALID_CREDENTIALS_MESSAGE,
    };
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });

  await createAdminSession(admin.id);
  redirect("/admin");
}
