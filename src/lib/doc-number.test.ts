import { describe, expect, it } from "vitest";
import { formatDocNumberInput, isValidDocNumberFormat } from "./doc-number";

describe("isValidDocNumberFormat", () => {
  it("aceita CPF com dígito verificador válido, formatado ou não", () => {
    expect(isValidDocNumberFormat("111.444.777-35")).toBe(true);
    expect(isValidDocNumberFormat("11144477735")).toBe(true);
  });

  it("aceita CNPJ com dígito verificador válido, formatado ou não", () => {
    expect(isValidDocNumberFormat("11.222.333/0001-81")).toBe(true);
    expect(isValidDocNumberFormat("11222333000181")).toBe(true);
  });

  it("rejeita CPF com dígito verificador errado (mesmo tamanho certo)", () => {
    // Mesmos 9 dígitos base de um CPF válido, só o último dígito
    // verificador trocado — exatamente o typo mais comum de digitar.
    expect(isValidDocNumberFormat("111.444.777-34")).toBe(false);
    expect(isValidDocNumberFormat("11144477734")).toBe(false);
  });

  it("rejeita CNPJ com dígito verificador errado (mesmo tamanho certo)", () => {
    expect(isValidDocNumberFormat("11.222.333/0001-80")).toBe(false);
    expect(isValidDocNumberFormat("11222333000180")).toBe(false);
  });

  it("rejeita sequência de dígito repetido, mesmo quando a conta do dígito verificador fecha", () => {
    expect(isValidDocNumberFormat("000.000.000-00")).toBe(false);
    expect(isValidDocNumberFormat("111.111.111-11")).toBe(false);
    expect(isValidDocNumberFormat("11.111.111/1111-11")).toBe(false);
  });

  it("rejeita quantidade de dígitos diferente de 11 ou 14", () => {
    expect(isValidDocNumberFormat("123")).toBe(false);
    expect(isValidDocNumberFormat("123456789012")).toBe(false);
    expect(isValidDocNumberFormat("")).toBe(false);
  });
});

describe("formatDocNumberInput", () => {
  it("formata progressivamente como CPF enquanto digita (até 11 dígitos)", () => {
    expect(formatDocNumberInput("1")).toBe("1");
    expect(formatDocNumberInput("11")).toBe("11");
    expect(formatDocNumberInput("111")).toBe("111");
    expect(formatDocNumberInput("1114")).toBe("111.4");
    expect(formatDocNumberInput("111444777")).toBe("111.444.777");
    expect(formatDocNumberInput("1114447773")).toBe("111.444.777-3");
    expect(formatDocNumberInput("11144477735")).toBe("111.444.777-35");
  });

  it("formata um CPF colado de uma vez só, igual ao digitado", () => {
    expect(formatDocNumberInput("11144477735")).toBe("111.444.777-35");
  });

  it("troca pro formato CNPJ a partir do 12º dígito", () => {
    expect(formatDocNumberInput("112223330001")).toBe("11.222.333/0001");
    expect(formatDocNumberInput("1122233300018")).toBe("11.222.333/0001-8");
    expect(formatDocNumberInput("11222333000181")).toBe("11.222.333/0001-81");
  });

  it("ignora tudo que não é dígito (colar já formatado não duplica pontuação)", () => {
    expect(formatDocNumberInput("111.444.777-35")).toBe("111.444.777-35");
    expect(formatDocNumberInput("11.222.333/0001-81")).toBe(
      "11.222.333/0001-81",
    );
  });

  it("trunca em 14 dígitos", () => {
    expect(formatDocNumberInput("112223330001819999")).toBe(
      "11.222.333/0001-81",
    );
  });
});
