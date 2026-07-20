"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createClientAction, type CreateClientFormState } from "../actions";

const initialState: CreateClientFormState = { error: null, created: null };

export default function NovoClientePage() {
  const [state, formAction, isPending] = useActionState(
    createClientAction,
    initialState,
  );
  const [copied, setCopied] = useState(false);

  if (state.created) {
    const { created } = state;

    return (
      <div className="mx-auto max-w-md">
        <div className="rounded-card border border-brand-500/30 bg-brand-tint p-6 shadow-card">
          <h1 className="text-lg font-semibold text-brand-tint-fg">
            Cliente cadastrado
          </h1>
          <p className="mt-1 text-sm text-brand-tint-fg">
            {created.name} · {created.docNumber}
          </p>

          <div className="mt-4 rounded-control border border-border bg-surface p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
              Senha de acesso (mostrada só agora)
            </p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="font-mono text-lg font-semibold text-fg">
                {created.password}
              </span>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(created.password);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="shrink-0 rounded-control border border-border px-2.5 py-1 text-xs font-medium text-fg-muted hover:border-fg-subtle"
              >
                {copied ? "Copiada" : "Copiar"}
              </button>
            </div>
            <p className="mt-2 text-xs text-fg-muted">
              Repasse pro cliente por telefone ou WhatsApp. Ela não fica
              salva em nenhum lugar visível — se perder, use &quot;gerar
              nova senha&quot; na página do cliente.
            </p>
          </div>

          <div className="mt-5 flex gap-3">
            <Link
              href={`/admin/clientes/${created.id}`}
              className="rounded-control bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Ver cliente
            </Link>
            <Link
              href="/admin/clientes/novo"
              className="rounded-control border border-border px-4 py-2 text-sm font-medium text-fg-muted hover:border-fg-subtle"
            >
              Cadastrar outro
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <Link
        href="/admin/clientes"
        className="mb-4 inline-block text-sm text-fg-muted hover:text-fg"
      >
        ← Voltar
      </Link>

      <h1 className="mb-4 text-xl font-bold text-fg">Novo Cliente</h1>

      <form
        action={formAction}
        className="space-y-4 rounded-card border border-border bg-surface p-6 shadow-card"
      >
        <div>
          <label
            htmlFor="docNumber"
            className="mb-1.5 block text-sm font-medium text-fg-muted"
          >
            CPF ou CNPJ
          </label>
          <input
            id="docNumber"
            name="docNumber"
            type="text"
            required
            className="w-full rounded-control border border-border bg-page px-3 py-2.5 text-fg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
          />
        </div>

        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-fg-muted"
          >
            Nome
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-control border border-border bg-page px-3 py-2.5 text-fg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-1.5 block text-sm font-medium text-fg-muted"
          >
            Telefone / WhatsApp
          </label>
          <input
            id="phone"
            name="phone"
            type="text"
            required
            placeholder="31999999999"
            className="w-full rounded-control border border-border bg-page px-3 py-2.5 text-fg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-fg-muted"
          >
            E-mail (opcional)
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full rounded-control border border-border bg-page px-3 py-2.5 text-fg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
          />
        </div>

        {state.error && (
          <p className="rounded-control bg-danger-tint px-3 py-2 text-sm text-danger-tint-fg">
            {state.error}
          </p>
        )}

        <p className="text-xs text-fg-muted">
          Uma senha de acesso é gerada automaticamente ao salvar — você vai
          poder copiá-la na próxima tela pra repassar ao cliente.
        </p>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-control bg-brand-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {isPending ? "Cadastrando…" : "Cadastrar cliente"}
        </button>
      </form>
    </div>
  );
}
