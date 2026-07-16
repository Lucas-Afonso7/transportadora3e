import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeInitScript } from "@/components/ThemeInitScript";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Transportadora 3E",
  description: "Gestão de pagamentos da Transportadora 3E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // O ThemeInitScript adiciona/remove "dark" nesse elemento antes do
      // React hidratar, de propósito (é o que evita o flash do tema
      // errado). Isso sempre vai divergir do que o servidor renderizou —
      // suppressHydrationWarning avisa o React pra não tratar isso como
      // bug e não tentar "corrigir" a classe de volta.
      suppressHydrationWarning
    >
      <head>
        <ThemeInitScript />
      </head>
      <body className="flex min-h-full flex-col bg-page text-fg">
        {children}
      </body>
    </html>
  );
}
