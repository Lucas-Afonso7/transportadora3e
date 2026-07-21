// Compara ignorando maiúscula/minúscula — usado pra nome, descrição etc.
export function matchesText(value: string, query: string): boolean {
  return value.toLowerCase().includes(query.trim().toLowerCase());
}

// Compara só os dígitos — usado pra CPF/CNPJ e telefone, que o usuário
// pode digitar com ou sem pontuação. "123.456" acha "123.456.789-01" e
// também "12345678901" sem precisar bater a formatação exata.
export function matchesDigits(value: string, query: string): boolean {
  const queryDigits = query.replace(/\D/g, "");
  if (queryDigits.length === 0) return false;
  return value.replace(/\D/g, "").includes(queryDigits);
}
