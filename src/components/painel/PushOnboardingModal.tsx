"use client";

import { useEffect, useState } from "react";
import { Bell, Share, SquarePlus } from "lucide-react";
import {
  getCurrentPushEndpoint,
  isIOS,
  isStandalonePWA,
  pushSupported,
  registerServiceWorker,
  subscribeToPush,
} from "@/lib/push-client";
import { savePushSubscription } from "@/lib/actions/push-subscription";
import { hasSeenPushPrompt, markPushPromptSeen } from "@/lib/push-onboarding";

type Visibility = "hidden" | "ask" | "ios-instructions";

// Pergunta uma vez só, no primeiro acesso de cada aparelho — depois disso
// (ativando, recusando ou só lendo a instrução do iOS) nunca mais aparece;
// pra mudar de ideia depois, o controle vive nas Configurações
// (ver SettingsMenu). O pedido de permissão do navegador só dispara com o
// clique em "Ativar", nunca sozinho ao carregar a página.
export function PushOnboardingModal() {
  const [visibility, setVisibility] = useState<Visibility>("hidden");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function check() {
      if (hasSeenPushPrompt()) return;

      if (isIOS() && !isStandalonePWA()) {
        setVisibility("ios-instructions");
        return;
      }
      if (!pushSupported()) {
        markPushPromptSeen();
        return;
      }

      await registerServiceWorker();
      const endpoint = await getCurrentPushEndpoint();
      if (endpoint) {
        // Já estava inscrito (ex.: sessão antiga antes desse modal existir)
        // — não faz sentido perguntar de novo.
        markPushPromptSeen();
        return;
      }

      setVisibility("ask");
    }
    check();
  }, []);

  function dismiss() {
    markPushPromptSeen();
    setVisibility("hidden");
  }

  async function activate() {
    setBusy(true);
    try {
      const subscription = await subscribeToPush();
      if (subscription) await savePushSubscription(subscription);
    } finally {
      setBusy(false);
      dismiss();
    }
  }

  if (visibility === "hidden") return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="push-onboarding-title"
    >
      <div className="w-full max-w-sm rounded-card border border-border border-t-2 border-t-brand-500 bg-surface p-5 shadow-card">
        {visibility === "ask" ? (
          <>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 shrink-0 text-brand-tint-fg" />
              <h2
                id="push-onboarding-title"
                className="font-display text-lg text-fg"
              >
                Ativar notificações?
              </h2>
            </div>
            <p className="mt-2 text-sm text-fg-muted">
              Avisamos quando seu pagamento for aprovado ou um serviço
              estiver perto de vencer — mesmo com o site fechado.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={dismiss}
                className="flex-1 rounded-control border border-border px-4 py-2.5 text-sm font-medium text-fg-muted hover:border-fg-subtle"
              >
                Agora não
              </button>
              <button
                type="button"
                onClick={activate}
                disabled={busy}
                className="flex-1 rounded-control bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {busy ? "Ativando…" : "Ativar"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 shrink-0 text-info-tint-fg" />
              <h2
                id="push-onboarding-title"
                className="font-display text-lg text-fg"
              >
                Quer receber notificações?
              </h2>
            </div>
            <p className="mt-2 text-sm text-fg-muted">
              No iPhone, primeiro instale o site: toque em{" "}
              <Share className="inline h-3.5 w-3.5 align-text-bottom" />{" "}
              <strong>Compartilhar</strong> na barra do Safari, depois em{" "}
              <SquarePlus className="inline h-3.5 w-3.5 align-text-bottom" />{" "}
              <strong>Adicionar à Tela de Início</strong>. Depois é só abrir
              pelo ícone instalado e ativar em Configurações.
            </p>
            <button
              type="button"
              onClick={dismiss}
              className="mt-4 w-full rounded-control bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              Entendi
            </button>
          </>
        )}

        <p className="mt-3 text-center text-xs text-fg-subtle">
          Pode ativar ou desativar depois em Configurações.
        </p>
      </div>
    </div>
  );
}
