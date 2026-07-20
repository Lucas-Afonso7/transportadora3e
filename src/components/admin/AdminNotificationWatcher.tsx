"use client";

import { useEffect, useRef } from "react";
import { notify } from "@/lib/notifications-client";
import { formatBRL } from "@/lib/format";

type PendingItem = {
  paymentId: number;
  clientName: string;
  amount: string;
  method: "PIX" | "DINHEIRO";
};

const POLL_MS = 20000;
const METHOD_LABEL: Record<PendingItem["method"], string> = {
  PIX: "um Pix",
  DINHEIRO: "um pagamento em dinheiro",
};

// A primeira busca só define a "linha de base" (o que já estava pendente
// antes de abrir a aba) — não notifica nada disso. Só notifica o que
// aparece depois, que é de fato um comprovante novo chegando.
export function AdminNotificationWatcher() {
  const knownIds = useRef<Set<number> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/notifications/admin", {
          cache: "no-store",
        });
        if (!res.ok || cancelled) return;

        const { items } = (await res.json()) as { items: PendingItem[] };
        if (cancelled) return;

        if (knownIds.current === null) {
          knownIds.current = new Set(items.map((item) => item.paymentId));
          return;
        }

        for (const item of items) {
          if (knownIds.current.has(item.paymentId)) continue;
          knownIds.current.add(item.paymentId);
          notify(
            "Novo comprovante recebido",
            `${item.clientName} enviou ${METHOD_LABEL[item.method]} de ${formatBRL(item.amount)}`,
          );
        }
      } catch {
        // Falha de rede pontual não é motivo pra quebrar nada — tenta de novo no próximo ciclo.
      }
    }

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return null;
}
