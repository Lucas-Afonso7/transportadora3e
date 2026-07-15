import { describe, expect, it } from "vitest";
import { formatPhoneBR } from "./format";

describe("formatPhoneBR", () => {
  it("formata celular com 9 dígitos", () => {
    expect(formatPhoneBR("5531995094324")).toBe("(31) 99509-4324");
  });

  it("formata fixo com 8 dígitos", () => {
    expect(formatPhoneBR("553133334444")).toBe("(31) 3333-4444");
  });

  it("devolve a string original se não bater com o formato esperado", () => {
    expect(formatPhoneBR("abc")).toBe("abc");
    expect(formatPhoneBR("123")).toBe("123");
  });
});
