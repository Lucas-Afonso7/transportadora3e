import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Fora do bundler do Next, "server-only" cai no export default (que
      // lança erro de propósito). Aponta pro empty.js que o próprio pacote
      // já publica pra esse caso — mesmo arquivo que o Next usa quando a
      // condição "react-server" está ativa.
      "server-only": path.resolve(
        __dirname,
        "./node_modules/server-only/empty.js",
      ),
    },
  },
  test: {
    environment: "node",
    // Testes de integração (submit-payment, review-payment) usam o
    // prisma real e precisam de DATABASE_URL, que o vitest não carrega
    // sozinho (diferente do Next, que carrega .env automaticamente).
    setupFiles: ["./vitest.setup.ts"],
  },
});
