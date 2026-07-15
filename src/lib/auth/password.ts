import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

// Custo 12: equilíbrio padrão entre segurança e tempo de resposta do login.
const SALT_ROUNDS = 12;

// Usada quando o admin cadastra um cliente novo: em vez de deixar o admin
// digitar uma senha fraca tipo "123456", o sistema gera uma senha forte e
// mostra pro admin UMA vez (ele repassa por telefone/WhatsApp, do mesmo
// jeito que já combina o resto com o cliente). Base64url de 9 bytes dá uma
// senha de 12 caracteres, fácil de ditar/copiar e ainda assim forte.
export function generateRandomPassword(): string {
  return randomBytes(9).toString("base64url");
}

export function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export function verifyPassword(
  plainPassword: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}
