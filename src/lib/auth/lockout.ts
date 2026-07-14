// Depois de MAX_FAILED_ATTEMPTS erros seguidos, a conta fica bloqueada por
// LOCKOUT_DURATION_MS. Isso existe pra tornar um ataque de força bruta contra
// CPF/CNPJ ou usuário do admin impraticável, sem exigir CAPTCHA.
export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutos

export function isLockedOut(lockedUntil: Date | null): boolean {
  return lockedUntil !== null && lockedUntil.getTime() > Date.now();
}

export function nextLockState(currentFailedAttempts: number): {
  failedLoginAttempts: number;
  lockedUntil: Date | null;
} {
  const failedLoginAttempts = currentFailedAttempts + 1;

  if (failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
    return {
      failedLoginAttempts: 0,
      lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS),
    };
  }

  return { failedLoginAttempts, lockedUntil: null };
}
