"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Share, SquarePlus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import {
  getCurrentPushEndpoint,
  isIOS,
  isStandalonePWA,
  pushSupported,
  registerServiceWorker,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push-client";
import {
  removePushSubscription,
  savePushSubscription,
} from "@/lib/actions/push-subscription";

type Status =
  | "checking"
  | "ios-not-installed"
  | "unsupported"
  | "off"
  | "on"
  | "requesting";

// Cartão visível na entrada do painel — é o "botão explícito" que o push
// exige (o navegador só deixa pedir permissão a partir de uma interação
// real do cliente, nunca automático ao carregar a página) e também o
// fallback pra quem não consegue ativar push (iOS sem instalar): em vez
// do botão falhar calado, explica o passo a passo.
export function PushNotificationCard() {
  const [status, setStatus] = useState<Status>("checking");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function check() {
      if (isIOS() && !isStandalonePWA()) {
        setStatus("ios-not-installed");
        return;
      }
      if (!pushSupported()) {
        setStatus("unsupported");
        return;
      }

      await registerServiceWorker();
      const endpoint = await getCurrentPushEndpoint();
      setStatus(endpoint ? "on" : "off");
    }
    check();
  }, []);

  async function handleActivate() {
    setError(null);
    setStatus("requesting");
    try {
      const subscription = await subscribeToPush();
      if (!subscription) {
        setError("Não foi possível ativar. Verifique a permissão de notificações do navegador.");
        setStatus("off");
        return;
      }
      const result = await savePushSubscription(subscription);
      setStatus(result.ok ? "on" : "off");
      if (!result.ok) {
        setError("Não foi possível salvar a inscrição. Tente novamente.");
      }
    } catch {
      setError("Não foi possível ativar notificações neste navegador.");
      setStatus("off");
    }
  }

  async function handleDeactivate() {
    setError(null);
    const endpoint = await unsubscribeFromPush();
    if (endpoint) await removePushSubscription(endpoint);
    setStatus("off");
  }

  if (status === "checking" || status === "unsupported") return null;

  if (status === "ios-not-installed") {
    return (
      <Card tone="info" className="mb-6">
        <div className="flex items-start gap-3">
          <Bell className="mt-0.5 h-5 w-5 shrink-0 text-info-tint-fg" />
          <div className="text-sm text-info-tint-fg">
            <p className="font-medium">
              Instale o app pra receber avisos de pagamento e vencimento
            </p>
            <p className="mt-1 text-info-tint-fg/90">
              No iPhone, notificações só funcionam depois de instalar: toque
              em <Share className="inline h-3.5 w-3.5 align-text-bottom" />{" "}
              <strong>Compartilhar</strong> na barra do Safari, depois em{" "}
              <SquarePlus className="inline h-3.5 w-3.5 align-text-bottom" />{" "}
              <strong>Adicionar à Tela de Início</strong>. Depois de instalado,
              abra o app pela tela inicial e ative aqui de novo.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card tone={status === "on" ? "default" : "brand"} className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {status === "on" ? (
            <Bell className="h-5 w-5 shrink-0 text-fg-muted" />
          ) : (
            <Bell className="h-5 w-5 shrink-0 text-brand-tint-fg" />
          )}
          <div>
            <p
              className={`text-sm font-medium ${status === "on" ? "text-fg" : "text-brand-tint-fg"}`}
            >
              {status === "on"
                ? "Notificações push ativadas"
                : "Receba avisos de pagamento aprovado e vencimento"}
            </p>
            {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
          </div>
        </div>

        {status === "on" ? (
          <button
            type="button"
            onClick={handleDeactivate}
            className="flex shrink-0 items-center gap-1.5 rounded-control border border-border px-3 py-1.5 text-xs font-medium text-fg-muted hover:border-fg-subtle"
          >
            <BellOff className="h-3.5 w-3.5" />
            Desativar
          </button>
        ) : (
          <button
            type="button"
            onClick={handleActivate}
            disabled={status === "requesting"}
            className="shrink-0 rounded-control bg-brand-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {status === "requesting" ? "Ativando…" : "Ativar notificações"}
          </button>
        )}
      </div>
    </Card>
  );
}
