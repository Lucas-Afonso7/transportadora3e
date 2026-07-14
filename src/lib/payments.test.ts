import { describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import {
  sumByStatus,
  computeApprovedAmount,
  computeRemainingAmount,
} from "./payments";

function payment(amount: string, status: string) {
  return { amount: new Prisma.Decimal(amount), status };
}

describe("sumByStatus", () => {
  it("soma só os pagamentos do status pedido", () => {
    const payments = [
      payment("100", "APROVADO"),
      payment("50", "AGUARDANDO_VALIDACAO"),
      payment("30", "APROVADO"),
      payment("20", "REJEITADO"),
    ];

    expect(sumByStatus(payments, "APROVADO").toString()).toBe("130");
    expect(sumByStatus(payments, "AGUARDANDO_VALIDACAO").toString()).toBe("50");
    expect(sumByStatus(payments, "REJEITADO").toString()).toBe("20");
  });

  it("retorna zero quando não há pagamentos do status", () => {
    expect(sumByStatus([], "APROVADO").toString()).toBe("0");
  });
});

describe("computeApprovedAmount", () => {
  it("ignora pagamentos rejeitados e aguardando validação", () => {
    const payments = [
      payment("1000", "REJEITADO"),
      payment("500", "AGUARDANDO_VALIDACAO"),
    ];
    expect(computeApprovedAmount(payments).toString()).toBe("0");
  });
});

describe("computeRemainingAmount", () => {
  it("subtrai só o valor aprovado do total", () => {
    const total = new Prisma.Decimal("1000");
    const payments = [
      payment("300", "APROVADO"),
      payment("200", "AGUARDANDO_VALIDACAO"), // não abate
    ];
    expect(computeRemainingAmount(total, payments).toString()).toBe("700");
  });

  it("nunca fica negativo, mesmo com pagamentos aprovados somando mais que o total", () => {
    const total = new Prisma.Decimal("1000");
    const payments = [payment("1200", "APROVADO")];
    expect(computeRemainingAmount(total, payments).toString()).toBe("0");
  });

  it("retorna o total inteiro quando não há pagamento aprovado", () => {
    const total = new Prisma.Decimal("750");
    expect(computeRemainingAmount(total, []).toString()).toBe("750");
  });

  it("chega a exatamente zero quando o total é pago certinho", () => {
    const total = new Prisma.Decimal("1998.99");
    const payments = [payment("1998.99", "APROVADO")];
    expect(computeRemainingAmount(total, payments).toString()).toBe("0");
  });
});
