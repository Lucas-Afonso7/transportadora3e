import { describe, expect, it } from "vitest";
import { isValidDocNumberFormat } from "./doc-number";

describe("isValidDocNumberFormat", () => {
  it("aceita CPF com 11 dígitos, formatado ou não", () => {
    expect(isValidDocNumberFormat("123.456.789-01")).toBe(true);
    expect(isValidDocNumberFormat("12345678901")).toBe(true);
  });

  it("aceita CNPJ com 14 dígitos, formatado ou não", () => {
    expect(isValidDocNumberFormat("12.345.678/0001-90")).toBe(true);
    expect(isValidDocNumberFormat("12345678000190")).toBe(true);
  });

  it("rejeita quantidade de dígitos diferente de 11 ou 14", () => {
    expect(isValidDocNumberFormat("123")).toBe(false);
    expect(isValidDocNumberFormat("123456789012")).toBe(false);
    expect(isValidDocNumberFormat("")).toBe(false);
  });
});
