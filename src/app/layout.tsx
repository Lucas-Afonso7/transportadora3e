import type { Metadata } from "next";
import { headers } from "next/headers";
import { IBM_Plex_Mono, IBM_Plex_Sans, Oswald } from "next/font/google";
import { ThemeInitScript } from "@/components/ThemeInitScript";
import "./globals.css";

// Duas famílias, papéis fixos (ver plano de design): Oswald é a
// condensada de título/rótulo/navegação — evoca placa de sinalização de
// rodovia; Plex Sans é o corpo; Plex Mono só entra em número que precisa
// alinhar em coluna (valor, CPF/CNPJ, data), como um comprovante impresso.
const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Transportadora 3E",
  description: "Gestão de pagamentos da Transportadora 3E",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Ler headers() aqui já é o suficiente pra forçar renderização
  // dinâmica em toda página do app (necessário pra CSP com nonce — ver
  // src/proxy.ts, que gera esse nonce por requisição e não existe em
  // build estático).
  const nonce = (await headers()).get("x-nonce");

  return (
    <html
      lang="pt-BR"
      className={`${oswald.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
      // O ThemeInitScript adiciona/remove "dark" nesse elemento antes do
      // React hidratar, de propósito (é o que evita o flash do tema
      // errado). Isso sempre vai divergir do que o servidor renderizou —
      // suppressHydrationWarning avisa o React pra não tratar isso como
      // bug e não tentar "corrigir" a classe de volta.
      suppressHydrationWarning
    >
      <head>
        <ThemeInitScript nonce={nonce} />
      </head>
      <body className="flex min-h-full flex-col bg-page font-sans text-fg">
        {children}
      </body>
    </html>
  );
}
