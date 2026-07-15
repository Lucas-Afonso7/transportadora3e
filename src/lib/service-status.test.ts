import { describe, expect, it } from "vitest";
import { categorizePainelService } from "./service-status";

const REF = new Date("2026-07-15T12:00:00Z"); // meio-dia UTC, de propósito — testa que a hora não interfere

describe("categorizePainelService", () => {
  it("serviço pago é sempre PAGO, mesmo com dueDate vencida", () => {
    const result = categorizePainelService(
      { status: "PAGO", dueDate: new Date("2026-01-01T00:00:00Z") },
      REF,
    );
    expect(result).toBe("PAGO");
  });

  it("sem dueDate e não pago cai em A_PAGAR", () => {
    const result = categorizePainelService(
      { status: "PENDENTE", dueDate: null },
      REF,
    );
    expect(result).toBe("A_PAGAR");
  });

  it("dueDate no passado é VENCIDO", () => {
    const result = categorizePainelService(
      { status: "PENDENTE", dueDate: new Date("2026-07-14T00:00:00Z") },
      REF,
    );
    expect(result).toBe("VENCIDO");
  });

  it("dueDate hoje NÃO é vencido (ainda dentro do prazo)", () => {
    const result = categorizePainelService(
      { status: "PENDENTE", dueDate: new Date("2026-07-15T00:00:00Z") },
      REF,
    );
    expect(result).toBe("VENCE_EM_7_DIAS");
  });

  it("dueDate exatamente 7 dias no futuro é VENCE_EM_7_DIAS (limite inclusivo)", () => {
    const result = categorizePainelService(
      { status: "PARCIAL", dueDate: new Date("2026-07-22T00:00:00Z") },
      REF,
    );
    expect(result).toBe("VENCE_EM_7_DIAS");
  });

  it("dueDate 8 dias no futuro já é A_PAGAR (fora da janela de 7 dias)", () => {
    const result = categorizePainelService(
      { status: "PENDENTE", dueDate: new Date("2026-07-23T00:00:00Z") },
      REF,
    );
    expect(result).toBe("A_PAGAR");
  });

  it("hora do referenceDate não muda a categoria (só a data importa)", () => {
    const noite = new Date("2026-07-15T23:59:00Z");
    const madrugada = new Date("2026-07-15T00:01:00Z");

    const dueDate = new Date("2026-07-14T00:00:00Z"); // vencido em relação ao dia 15, nas duas horas

    expect(categorizePainelService({ status: "PENDENTE", dueDate }, noite)).toBe(
      "VENCIDO",
    );
    expect(
      categorizePainelService({ status: "PENDENTE", dueDate }, madrugada),
    ).toBe("VENCIDO");
  });
});
