// Validação de CPF/CNPJ: confere a quantidade de dígitos E o dígito
// verificador (algoritmo oficial da Receita Federal), não só o tamanho.
// Além de pegar o erro de digitação que muda a quantidade de dígitos
// (typo que corta ou duplica um dígito), agora também pega o typo mais
// comum de todos — dois dígitos trocados de lugar ou um dígito errado
// no meio —, que resulta num número do tamanho certo mas inválido.
export function isValidDocNumberFormat(docNumber: string): boolean {
  const digits = docNumber.replace(/\D/g, "");

  if (digits.length === 11) return isValidCPF(digits);
  if (digits.length === 14) return isValidCNPJ(digits);
  return false;
}

// Sequências de dígito repetido (000.000.000-00, 111.111.111-11, ...)
// passam pelo cálculo do dígito verificador matematicamente (a conta
// fecha), mas nunca são um CPF/CNPJ de verdade — a Receita Federal nem
// emite. Todo validador de referência trata esse caso à parte.
function isRepeatedDigits(digits: string): boolean {
  return digits.split("").every((d) => d === digits[0]);
}

// `weights[i]` multiplica `digits[i]` — o tamanho de `weights` decide
// quantos dígitos entram na soma (9 ou 10 pra CPF, 12 ou 13 pra CNPJ).
function checkDigit(digits: string, weights: number[]): number {
  const sum = weights.reduce(
    (acc, weight, i) => acc + Number(digits[i]) * weight,
    0,
  );
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

function isValidCPF(digits: string): boolean {
  if (isRepeatedDigits(digits)) return false;

  const digit1 = checkDigit(digits, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const digit2 = checkDigit(digits, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);

  return digits[9] === String(digit1) && digits[10] === String(digit2);
}

function isValidCNPJ(digits: string): boolean {
  if (isRepeatedDigits(digits)) return false;

  const digit1 = checkDigit(digits, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const digit2 = checkDigit(digits, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return digits[12] === String(digit1) && digits[13] === String(digit2);
}
