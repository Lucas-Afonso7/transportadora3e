import { describe, expect, it } from "vitest";
import { detectFileSignature } from "./file-signature";

describe("detectFileSignature", () => {
  it("reconhece JPEG pelos magic bytes", () => {
    const buffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    expect(detectFileSignature(buffer)).toBe("image/jpeg");
  });

  it("reconhece PNG pelos magic bytes", () => {
    const buffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    expect(detectFileSignature(buffer)).toBe("image/png");
  });

  it("reconhece WEBP pelo contêiner RIFF + fourCC WEBP", () => {
    const buffer = Buffer.from([
      0x52, 0x49, 0x46, 0x46, // "RIFF"
      0x00, 0x00, 0x00, 0x00, // tamanho (irrelevante pra detecção)
      0x57, 0x45, 0x42, 0x50, // "WEBP"
    ]);
    expect(detectFileSignature(buffer)).toBe("image/webp");
  });

  it("reconhece PDF pelos magic bytes", () => {
    const buffer = Buffer.from("%PDF-1.4\n%âãÏÓ", "latin1");
    expect(detectFileSignature(buffer)).toBe("application/pdf");
  });

  it("não reconhece um RIFF que não é WEBP (ex.: WAV)", () => {
    const buffer = Buffer.from([
      0x52, 0x49, 0x46, 0x46, // "RIFF"
      0x00, 0x00, 0x00, 0x00,
      0x57, 0x41, 0x56, 0x45, // "WAVE", não "WEBP"
    ]);
    expect(detectFileSignature(buffer)).toBeNull();
  });

  it("retorna null pra conteúdo que não bate com nenhuma assinatura conhecida (ex.: HTML disfarçado)", () => {
    const buffer = Buffer.from("<html><script>alert(1)</script></html>");
    expect(detectFileSignature(buffer)).toBeNull();
  });

  it("retorna null pra buffer vazio ou menor que a assinatura", () => {
    expect(detectFileSignature(Buffer.from([]))).toBeNull();
    expect(detectFileSignature(Buffer.from([0x89, 0x50]))).toBeNull();
  });
});
