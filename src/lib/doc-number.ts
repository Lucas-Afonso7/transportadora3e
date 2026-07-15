// Validação leve de CPF/CNPJ: só confere a quantidade de dígitos (11 ou
// 14), sem checar dígito verificador. O admin cadastra clientes que ele
// já conhece por telefone — o risco aqui não é fraude, é erro de digitação
// que trocaria o login do cliente errado; checar o tamanho já pega a
// maioria dos casos (typos que cortam ou duplicam dígito).
export function isValidDocNumberFormat(docNumber: string): boolean {
  const digits = docNumber.replace(/\D/g, "");
  return digits.length === 11 || digits.length === 14;
}
