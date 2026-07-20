"use client";

import { useEffect, useRef } from "react";
import { notify } from "@/lib/notifications-client";
import { formatBRL } from "@/lib/format";

type ClientPayment = {
  id: number;
  status: "AGUARDANDO_VALIDACAO" | "APROVADO" | "REJEITADO";
  serviceDescription: string;
  amount: string;
};

const POLL_MS = 20000;

// A primeira busca só define a linha de base (status atual de cada
// pagamento quando a aba abriu) — notificação só dispara quando o status
// de um pagamento MUDA depois disso (aprovado ou rejeitado pelo admin).
export function ClientNotificationWatcher() {
  const knownStatus = useRef<Map<number, string> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/notifications/client", {
          cache: "no-store",
        });
        if (!res.ok || cancelled) return;

        const { payments } = (await res.json()) as { payments: ClientPayment[] };
        if (cancelled) return;

        if (knownStatus.current === null) {
          knownStatus.current = new Map(
            payments.map((payment) => [payment.id, payment.status]),
          );
          return;
        }

        for (const payment of payments) {
          const previousStatus = knownStatus.current.get(payment.id);
          knownStatus.current.set(payment.id, payment.status);

          if (!previousStatus || previousStatus === payment.status) continue;

          if (payment.status === "APROVADO") {
            notify(
              "Pagamento aprovado",
              `Seu pagamento de ${formatBRL(payment.amount)} para "${payment.serviceDescription}" foi aprovado.`,
            );
          } else if (payment.status === "REJEITADO") {
            notify(
              "Pagamento rejeitado",
              `Seu pagamento de ${formatBRL(payment.amount)} para "${payment.serviceDescription}" foi rejeitado.`,
            );
          }
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
