"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Sem WebSocket/SSE de propósito — esse app não tem infra pra isso, e
// não precisa pro tamanho da operação. router.refresh() busca os Server
// Components de novo com dado fresco do banco (sem custo de cache, já
// que a leitura é via Prisma, não fetch) e o React só troca o que
// mudou — sem perder scroll nem estado local da página.
export function AutoRefresh({ intervalMs = 20000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
