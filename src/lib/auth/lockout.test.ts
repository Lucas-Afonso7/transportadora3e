import { describe, expect, it } from "vitest";
import { isLockedOut, nextLockState, MAX_FAILED_ATTEMPTS } from "./lockout";

describe("isLockedOut", () => {
  it("retorna false quando não há bloqueio", () => {
    expect(isLockedOut(null)).toBe(false);
  });

  it("retorna false quando o bloqueio já expirou", () => {
    expect(isLockedOut(new Date(Date.now() - 1000))).toBe(false);
  });

  it("retorna true quando o bloqueio ainda está no futuro", () => {
    expect(isLockedOut(new Date(Date.now() + 60_000))).toBe(true);
  });
});

describe("nextLockState", () => {
  it("incrementa o contador sem bloquear antes do limite", () => {
    const result = nextLockState(0);
    expect(result.failedLoginAttempts).toBe(1);
    expect(result.lockedUntil).toBeNull();
  });

  it(`bloqueia e zera o contador ao atingir ${MAX_FAILED_ATTEMPTS} tentativas`, () => {
    const result = nextLockState(MAX_FAILED_ATTEMPTS - 1);
    expect(result.failedLoginAttempts).toBe(0);
    expect(result.lockedUntil).not.toBeNull();
    expect(result.lockedUntil!.getTime()).toBeGreaterThan(Date.now());
  });

  it("nunca deixa o contador passar do limite sem bloquear", () => {
    for (let attempts = 0; attempts < MAX_FAILED_ATTEMPTS + 5; attempts++) {
      const result = nextLockState(attempts);
      if (result.lockedUntil) {
        expect(result.failedLoginAttempts).toBe(0);
      } else {
        expect(result.failedLoginAttempts).toBeLessThan(MAX_FAILED_ATTEMPTS);
      }
    }
  });
});
