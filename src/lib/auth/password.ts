import bcrypt from "bcryptjs";

// Custo 12: equilíbrio padrão entre segurança e tempo de resposta do login.
const SALT_ROUNDS = 12;

export function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export function verifyPassword(
  plainPassword: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}
