import { describe, expect, it } from "vitest";
import { matchesDigits, matchesText } from "./search-match";

describe("matchesText", () => {
  it("ignora maiúscula/minúscula", () => {
    expect(matchesText("Cliente Teste", "cliente")).toBe(true);
    expect(matchesText("Cliente Teste", "TESTE")).toBe(true);
  });

  it("busca por substring, não só prefixo", () => {
    expect(matchesText("Frete Belo Horizonte", "horizonte")).toBe(true);
  });

  it("não acha o que não está lá", () => {
    expect(matchesText("Cliente Teste", "outro")).toBe(false);
  });
});

describe("matchesDigits", () => {
  it("acha CPF formatado buscando só os dígitos", () => {
    expect(matchesDigits("111.444.777-35", "11144477735")).toBe(true);
    expect(matchesDigits("111.444.777-35", "444.777")).toBe(true);
  });

  it("acha telefone formatado buscando parte dos dígitos", () => {
    expect(matchesDigits("(31) 99509-4324", "995094324")).toBe(true);
  });

  it("query sem nenhum dígito nunca bate", () => {
    expect(matchesDigits("111.444.777-35", "abc")).toBe(false);
    expect(matchesDigits("111.444.777-35", "")).toBe(false);
  });

  it("não acha dígitos que não estão na sequência", () => {
    expect(matchesDigits("111.444.777-35", "999")).toBe(false);
  });
});
