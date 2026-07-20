"use client";

import { useActionState, useState } from "react";
import {
  regeneratePasswordAction,
  type RegeneratePasswordFormState,
} from "@/app/admin/(protegido)/clientes/actions";

const initialState: RegeneratePasswordFormState = {
  error: null,
  newPassword: null,
};

export function RegeneratePasswordButton({ clientId }: { clientId: number }) {
  const [state, formAction, isPending] = useActionState(
    regeneratePasswordAction,
    initialState,
  );
  const [copied, setCopied] = useState(false);

  if (state.newPassword) {
    return (
      <div className="rounded-control border border-brand-500/30 bg-brand-tint p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
          Nova senha (mostrada só agora)
        </p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="font-mono text-base font-semibold text-fg">
            {state.newPassword}
          </span>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(state.newPassword!);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="shrink-0 rounded-control border border-border bg-surface px-2.5 py-1 text-xs font-medium text-fg-muted hover:border-fg-subtle"
          >
            {copied ? "Copiada" : "Copiar"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="clientId" value={clientId} />
      {state.error && (
        <p className="mb-2 text-sm text-danger-tint-fg">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-control border border-border px-3 py-1.5 text-sm font-medium text-fg-muted hover:border-fg-subtle disabled:opacity-60"
      >
        {isPending ? "Gerando…" : "Gerar nova senha"}
      </button>
    </form>
  );
}
