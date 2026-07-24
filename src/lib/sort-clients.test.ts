import { describe, expect, it } from "vitest";
import { sortClients } from "./sort-clients";
import type { AdminClientSummary } from "@/lib/data/admin-clients";

function client(overrides: Partial<AdminClientSummary>): AdminClientSummary {
  return {
    id: 1,
    name: "Cliente",
    docNumber: "11144477735",
    phone: "5531999998888",
    email: null,
    totalContratado: "0",
    totalPago: "0",
    totalPendente: "0",
    createdAt: new Date("2026-01-01"),
    ...overrides,
  };
}

describe("sortClients", () => {
  const clients = [
    client({ id: 1, name: "Carlos", totalContratado: "500", totalPendente: "100", createdAt: new Date("2026-03-01") }),
    client({ id: 2, name: "ana", totalContratado: "1000", totalPendente: "900", createdAt: new Date("2026-01-01") }),
    client({ id: 3, name: "Bruno", totalContratado: "200", totalPendente: "0", createdAt: new Date("2026-05-01") }),
  ];

  it("ordena por nome A-Z sem diferenciar maiúscula/minúscula (localeCompare pt-BR)", () => {
    const result = sortClients(clients, "name-asc");
    expect(result.map((c) => c.name)).toEqual(["ana", "Bruno", "Carlos"]);
  });

  it("ordena por nome Z-A", () => {
    const result = sortClients(clients, "name-desc");
    expect(result.map((c) => c.name)).toEqual(["Carlos", "Bruno", "ana"]);
  });

  it("ordena por valor contratado, maior pro menor", () => {
    const result = sortClients(clients, "contratado-desc");
    expect(result.map((c) => c.id)).toEqual([2, 1, 3]);
  });

  it("ordena por valor contratado, menor pro maior", () => {
    const result = sortClients(clients, "contratado-asc");
    expect(result.map((c) => c.id)).toEqual([3, 1, 2]);
  });

  it("ordena por valor em aberto, maior pro menor", () => {
    const result = sortClients(clients, "pendente-desc");
    expect(result.map((c) => c.id)).toEqual([2, 1, 3]);
  });

  it("ordena por data de cadastro, mais recente primeiro", () => {
    const result = sortClients(clients, "date-desc");
    expect(result.map((c) => c.id)).toEqual([3, 1, 2]);
  });

  it("ordena por data de cadastro, mais antigo primeiro", () => {
    const result = sortClients(clients, "date-asc");
    expect(result.map((c) => c.id)).toEqual([2, 1, 3]);
  });

  it("não muta o array original", () => {
    const original = [...clients];
    sortClients(clients, "name-desc");
    expect(clients).toEqual(original);
  });
});
