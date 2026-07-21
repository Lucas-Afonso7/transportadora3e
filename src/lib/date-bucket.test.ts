import { describe, expect, it } from "vitest";
import { lastNMonthKeys, monthKeySaoPaulo, monthLabelPtBR } from "./date-bucket";

describe("monthKeySaoPaulo", () => {
  it("usa o mês de São Paulo, não o de UTC, perto da virada do mês", () => {
    // 2026-08-01 02:30 UTC = 2026-07-31 23:30 em São Paulo (UTC-3): ainda julho.
    const nearMidnight = new Date("2026-08-01T02:30:00.000Z");
    expect(monthKeySaoPaulo(nearMidnight)).toBe("2026-07");
  });

  it("não confunde com o mês de UTC quando os dois já bateram", () => {
    // 2026-08-01 10:00 UTC = 2026-08-01 07:00 em São Paulo: agosto nos dois.
    const midMorning = new Date("2026-08-01T10:00:00.000Z");
    expect(monthKeySaoPaulo(midMorning)).toBe("2026-08");
  });
});

describe("monthLabelPtBR", () => {
  it("formata a chave AAAA-MM como mês/ano curto em pt-BR", () => {
    expect(monthLabelPtBR("2026-07")).toBe("jul/26");
  });
});

describe("lastNMonthKeys", () => {
  it("gera as últimas N chaves, mais antigo primeiro, terminando no mês atual", () => {
    const now = new Date("2026-07-15T12:00:00.000Z");
    expect(lastNMonthKeys(6, now)).toEqual([
      "2026-02",
      "2026-03",
      "2026-04",
      "2026-05",
      "2026-06",
      "2026-07",
    ]);
  });

  it("cruza a virada de ano corretamente", () => {
    const now = new Date("2026-01-20T12:00:00.000Z");
    expect(lastNMonthKeys(3, now)).toEqual(["2025-11", "2025-12", "2026-01"]);
  });

  it("usa o mês de São Paulo do instante 'now', não o de UTC", () => {
    // 2026-08-01 02:00 UTC é ainda 31/jul em São Paulo — o mês mais recente
    // da lista precisa ser julho, não agosto.
    const now = new Date("2026-08-01T02:00:00.000Z");
    const keys = lastNMonthKeys(6, now);
    expect(keys[keys.length - 1]).toBe("2026-07");
  });
});
