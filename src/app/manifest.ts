import type { MetadataRoute } from "next";

// Pré-requisito pra Web Push funcionar em qualquer plataforma — sem
// manifest, não tem "app" pra instalar (crítico no iOS: Safari só libera
// push depois que o site foi instalado na Tela de Início a partir de um
// manifest válido). start_url aponta pro painel do cliente, que é onde
// o push é usado; o admin não precisa instalar nada.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Transportadora 3E",
    short_name: "3E",
    description: "Acompanhe seus serviços e pagamentos com a Transportadora 3E.",
    start_url: "/painel",
    scope: "/",
    display: "standalone",
    background_color: "#f6f5f3",
    theme_color: "#d9552e",
    icons: [
      {
        src: "/logo-3e.png",
        sizes: "787x787",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
