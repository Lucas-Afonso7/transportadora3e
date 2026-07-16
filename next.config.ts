import type { NextConfig } from "next";

// CSP sem nonce (permite 'unsafe-inline' em script/style): o app usa scripts
// inline do próprio Next (hidratação) e o ThemeInitScript (Etapa "tema
// escuro"). Uma CSP com nonce seria mais estrita, mas exige middleware
// gerando nonce por requisição e propagando pra cada script — trade-off
// que não compensa pro tamanho desse app. Mesmo sem nonce, isso já barra
// os vetores mais comuns: iframes de terceiros (frame-ancestors),
// <object>/<embed> (object-src), injeção de <base> (base-uri), e carrega
// tudo (fontes, imagens, conexões) só do próprio domínio.
// Em dev, o React usa eval() pra reconstruir stack traces do overlay de
// erro e de outras ferramentas de debug — nunca em produção. Sem
// 'unsafe-eval' liberado só em dev, o próprio modo de desenvolvimento
// quebra.
const isDev = process.env.NODE_ENV !== "production";

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join("; ");

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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
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
