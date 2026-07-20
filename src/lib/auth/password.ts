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

// Hash bcrypt fixo, custo 12 (igual SALT_ROUNDS) — não corresponde a
// nenhuma senha real, só existe pra ter o formato certo de comparar.
// Usado quando a conta não existe: sem isso, "CPF/usuário não
// cadastrado" retorna na hora (sem nenhum bcrypt.compare) enquanto "CPF
// cadastrado, senha errada" demora ~100-300ms (o custo do bcrypt) — dá
// pra diferenciar os dois casos só pelo tempo de resposta, mesmo com a
// mensagem de erro sendo idêntica. Comparando contra esse hash fixo
// quando não há conta, o tempo fica parecido nos dois casos.
const DUMMY_PASSWORD_HASH =
  "$2b$12$AQhvZRWmee6UbFRTQN90juAmO.oKqKwAzZkGfHbFoLu3gHgFRDW0u";

// `passwordHash: null` representa "conta não encontrada" — nesse caso
// SEMPRE compara contra DUMMY_PASSWORD_HASH (e sempre retorna false),
// nunca pula a comparação. Quem chama não precisa saber disso: só passa
// `client?.passwordHash ?? null` e o timing já sai consistente.
export function verifyPassword(
  plainPassword: string,
  passwordHash: string | null,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash ?? DUMMY_PASSWORD_HASH);
}
