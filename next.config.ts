import type { NextConfig } from "next";

// Content-Security-Policy não fica aqui: precisa de um nonce novo por
// requisição (pra não depender de 'unsafe-inline', que o navegador
// ignora quando um nonce já está presente — ou seja, sem nonce a CSP
// não bloqueava script inline nenhum de verdade). headers() daqui só
// roda em build/estático, sem acesso à requisição — quem monta e envia
// a CSP é o src/proxy.ts, por requisição.
const nextConfig: NextConfig = {
  // Tira o header "X-Powered-By: Next.js" (vem ligado por padrão) — não
  // é uma falha em si, mas não tem motivo pra anunciar de graça pra
  // quem for reconhecer a stack qual framework/versão está rodando.
  poweredByHeader: false,
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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Defesa em profundidade contra clickjacking — frame-ancestors
          // na CSP já cobre navegadores modernos, mas X-Frame-Options
          // ainda é respeitado por alguns clientes mais antigos.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
