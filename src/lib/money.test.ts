import { describe, expect, it } from "vitest";
import { parseAmountInput } from "./money";

describe("parseAmountInput", () => {
  it("aceita valor inteiro", () => {
    expect(parseAmountInput("500")?.toString()).toBe("500");
  });

  it("aceita valor com 2 casas decimais", () => {
    expect(parseAmountInput("19.99")?.toString()).toBe("19.99");
  });

  it("aceita valor com 1 casa decimal", () => {
    expect(parseAmountInput("10.5")?.toString()).toBe("10.5");
  });

  it("preserva precisão exata (sem erro de ponto flutuante)", () => {
    // 0.1 + 0.2 em float binário dá 0.30000000000000004 — aqui não pode
    // acontecer porque nunca convertemos pra Number.
    const amount = parseAmountInput("1998.99");
    expect(amount?.toString()).toBe("1998.99");
  });

  it("rejeita mais de 2 casas decimais", () => {
    expect(parseAmountInput("500.123")).toBeNull();
  });

  it("rejeita zero", () => {
    expect(parseAmountInput("0")).toBeNull();
    expect(parseAmountInput("0.00")).toBeNull();
  });

  it("rejeita valor negativo", () => {
    expect(parseAmountInput("-50")).toBeNull();
  });

  it("rejeita texto não numérico", () => {
    expect(parseAmountInput("abc")).toBeNull();
    expect(parseAmountInput("50,00")).toBeNull();
    expect(parseAmountInput("R$ 50")).toBeNull();
  });

  it("rejeita entrada que não é string", () => {
    expect(parseAmountInput(null)).toBeNull();
    expect(parseAmountInput(undefined)).toBeNull();
    expect(parseAmountInput(500)).toBeNull();
  });

  it("aceita espaços nas bordas", () => {
    expect(parseAmountInput("  100.00  ")?.toString()).toBe("100");
  });
});
