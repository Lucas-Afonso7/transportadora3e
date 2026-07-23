// Controla se o modal de "ativar notificações?" já foi mostrado nesse
// aparelho/navegador — "primeiro login no celular ou PC" na prática é por
// localStorage: cada aparelho/navegador tem o seu, então o modal aparece
// uma vez em cada um, não uma vez só por conta.
const PROMPT_SEEN_KEY = "t3e-push-prompt-seen";

export function hasSeenPushPrompt(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(PROMPT_SEEN_KEY) === "true";
}

export function markPushPromptSeen(): void {
  localStorage.setItem(PROMPT_SEEN_KEY, "true");
}
