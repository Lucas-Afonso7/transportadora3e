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

type ClientService = {
  id: number;
  description: string;
  totalAmount: string;
};

const POLL_MS = 20000;

// A primeira busca só define a linha de base (pagamentos e serviços que
// já existiam quando a aba abriu) — não notifica nada disso. Depois,
// notifica quando: 1) um pagamento muda de status (aprovado/rejeitado
// pelo admin), ou 2) um serviço novo aparece (cadastrado pelo admin).
export function ClientNotificationWatcher() {
  const knownStatus = useRef<Map<number, string> | null>(null);
  const knownServiceIds = useRef<Set<number> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/notifications/client", {
          cache: "no-store",
        });
        if (!res.ok || cancelled) return;

        const { payments, services } = (await res.json()) as {
          payments: ClientPayment[];
          services: ClientService[];
        };
        if (cancelled) return;

        if (knownStatus.current === null || knownServiceIds.current === null) {
          knownStatus.current = new Map(
            payments.map((payment) => [payment.id, payment.status]),
          );
          knownServiceIds.current = new Set(
            services.map((service) => service.id),
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

        for (const service of services) {
          if (knownServiceIds.current.has(service.id)) continue;
          knownServiceIds.current.add(service.id);
          notify(
            "Novo serviço",
            `"${service.description}" foi adicionado, no valor de ${formatBRL(service.totalAmount)}.`,
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
