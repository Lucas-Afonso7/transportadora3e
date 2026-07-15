import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // O upload de comprovante (Etapa 5) aceita até 8MB (MAX_PROOF_SIZE_BYTES
      // em src/lib/uploads.ts). O limite padrão do Next pra Server Actions é
      // 1MB — sem isso, qualquer foto de celular acima de ~1MB é rejeitada
      // pelo próprio Next antes da nossa validação rodar, e o erro aparece
      // no navegador como um genérico "Failed to fetch".
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
