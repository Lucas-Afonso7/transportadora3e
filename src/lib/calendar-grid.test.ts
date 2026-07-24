import { describe, expect, it } from "vitest";
import { buildMonthGrid } from "./calendar-grid";

describe("buildMonthGrid", () => {
  it("começa com o número certo de células vazias antes do dia 1", () => {
    // julho/2026: dia 1 cai numa quarta-feira (índice 3 na semana D-S-T-Q-Q-S-S)
    const cells = buildMonthGrid("2026-07");
    expect(cells.slice(0, 3)).toEqual([null, null, null]);
    expect(cells[3]).toBe(1);
  });

  it("inclui todos os dias do mês em ordem", () => {
    const cells = buildMonthGrid("2026-07");
    const days = cells.filter((c) => c !== null);
    expect(days).toEqual(Array.from({ length: 31 }, (_, i) => i + 1));
  });

  it("respeita fevereiro em ano não bissexto (28 dias)", () => {
    const cells = buildMonthGrid("2026-02");
    const days = cells.filter((c) => c !== null);
    expect(days.length).toBe(28);
    expect(days[days.length - 1]).toBe(28);
  });

  it("respeita fevereiro em ano bissexto (29 dias)", () => {
    const cells = buildMonthGrid("2024-02");
    const days = cells.filter((c) => c !== null);
    expect(days.length).toBe(29);
  });

  it("o total de células é sempre múltiplo de 7", () => {
    for (const monthKey of ["2026-01", "2026-02", "2026-04", "2026-07"]) {
      expect(buildMonthGrid(monthKey).length % 7).toBe(0);
    }
  });
});
