import { describe, expect, it } from "vitest";
import { isRateLimited } from "./rate-limit";

describe("isRateLimited", () => {
  it("permite as primeiras tentativas", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 20; i++) {
      expect(isRateLimited(key)).toBe(false);
    }
  });

  it("bloqueia depois de passar do limite", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 20; i++) {
      isRateLimited(key);
    }
    expect(isRateLimited(key)).toBe(true);
  });

  it("chaves diferentes não se afetam", () => {
    const keyA = `test-a-${Math.random()}`;
    const keyB = `test-b-${Math.random()}`;

    for (let i = 0; i < 25; i++) {
      isRateLimited(keyA);
    }

    expect(isRateLimited(keyB)).toBe(false);
  });
});
