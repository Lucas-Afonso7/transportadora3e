import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Gera um nonce novo a cada requisição e monta a CSP com ele em vez de
// 'unsafe-inline' em script-src/style-src — 'unsafe-inline' é ignorado
// pelo navegador quando um script/estilo já tem outra fonte de confiança
// (nonce), então antes disso a CSP não bloqueava nada de fato: qualquer
// <script> inline injetado (ex.: por uma falha de XSS futura) passaria
// igual. Com nonce, só o que o próprio servidor gerou nessa requisição
// específica (e carimbou com esse nonce) executa.
//
// Isso obriga renderização dinâmica em toda página (Next só consegue
// injetar o nonce a partir de headers() de uma requisição de verdade,
// não em página estática gerada em build) — aceitável pro tamanho dessa
// operação, e as páginas de login são exatamente onde essa proteção
// mais importa.
const isDev = process.env.NODE_ENV !== "production";

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' ${isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`}`,
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: [
    {
      // Tudo, exceto assets estáticos do próprio Next — CSP/nonce não
      // tem o que fazer neles, e gerar um nonce por chunk estático só
      // desperdiçaria trabalho.
      source: "/((?!_next/static|_next/image|favicon.ico|icon.png).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
