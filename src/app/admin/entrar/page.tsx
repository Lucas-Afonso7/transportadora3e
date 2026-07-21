"use client";

import { useActionState } from "react";
import { adminLoginAction } from "./actions";
import { initialLoginState } from "@/lib/auth/form-state";
import { Card } from "@/components/ui/Card";

export default function AdminEntrarPage() {
  const [state, formAction, isPending] = useActionState(
    adminLoginAction,
    initialLoginState,
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-page px-page-x py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-sm font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
            Transportadora 3E
          </span>
          <h1 className="font-display mt-2 text-xl text-fg">
            Painel administrativo
          </h1>
        </div>

        <Card padding="lg">
          <form action={formAction}>
            <div className="mb-4">
              <label
                htmlFor="username"
                className="mb-1.5 block text-sm font-medium text-fg-muted"
              >
                Usuário
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="w-full rounded-control border border-border bg-page px-3 py-2.5 text-fg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
              />
            </div>

            <div className="mb-5">
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-fg-muted"
              >
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-control border border-border bg-page px-3 py-2.5 text-fg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
              />
            </div>

            {state.error && (
              <p className="mb-4 rounded-control bg-danger-tint px-3 py-2 text-sm text-danger-tint-fg">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-control bg-brand-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
            >
              {isPending ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </Card>
      </div>
    </main>
  );
}
