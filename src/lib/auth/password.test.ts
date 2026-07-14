import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("hashPassword / verifyPassword", () => {
  it("gera um hash diferente da senha original", async () => {
    const hash = await hashPassword("SenhaForte123");
    expect(hash).not.toBe("SenhaForte123");
  });

  it("confirma a senha correta", async () => {
    const hash = await hashPassword("SenhaForte123");
    expect(await verifyPassword("SenhaForte123", hash)).toBe(true);
  });

  it("rejeita a senha errada", async () => {
    const hash = await hashPassword("SenhaForte123");
    expect(await verifyPassword("outra-senha", hash)).toBe(false);
  });

  it("gera hashes diferentes para a mesma senha (salt aleatório)", async () => {
    const [hashA, hashB] = await Promise.all([
      hashPassword("SenhaForte123"),
      hashPassword("SenhaForte123"),
    ]);
    expect(hashA).not.toBe(hashB);
  });
});
