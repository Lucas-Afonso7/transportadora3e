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
        <div className="rounded-card border border-brand-200 bg-brand-50 p-6 shadow-card">
          <h1 className="text-lg font-semibold text-brand-800">
            Cliente cadastrado
          </h1>
          <p className="mt-1 text-sm text-brand-700">
            {created.name} · {created.docNumber}
          </p>

          <div className="mt-4 rounded-control border border-brand-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
              Senha de acesso (mostrada só agora)
            </p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="font-mono text-lg font-semibold text-ink-900">
                {created.password}
              </span>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(created.password);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="shrink-0 rounded-control border border-ink-300 px-2.5 py-1 text-xs font-medium text-ink-700 hover:border-ink-400"
              >
                {copied ? "Copiada" : "Copiar"}
              </button>
            </div>
            <p className="mt-2 text-xs text-ink-500">
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
              className="rounded-control border border-ink-300 px-4 py-2 text-sm font-medium text-ink-600 hover:border-ink-400"
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
        className="mb-4 inline-block text-sm text-ink-500 hover:text-ink-900"
      >
        ← Voltar
      </Link>

      <h1 className="mb-4 text-xl font-bold text-ink-900">Novo Cliente</h1>

      <form
        action={formAction}
        className="space-y-4 rounded-card border border-ink-200 bg-white p-6 shadow-card"
      >
        <div>
          <label
            htmlFor="docNumber"
            className="mb-1.5 block text-sm font-medium text-ink-700"
          >
            CPF ou CNPJ
          </label>
          <input
            id="docNumber"
            name="docNumber"
            type="text"
            required
            className="w-full rounded-control border border-ink-300 px-3 py-2.5 text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-ink-700"
          >
            Nome
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-control border border-ink-300 px-3 py-2.5 text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-1.5 block text-sm font-medium text-ink-700"
          >
            Telefone / WhatsApp
          </label>
          <input
            id="phone"
            name="phone"
            type="text"
            required
            placeholder="31999999999"
            className="w-full rounded-control border border-ink-300 px-3 py-2.5 text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-ink-700"
          >
            E-mail (opcional)
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full rounded-control border border-ink-300 px-3 py-2.5 text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        {state.error && (
          <p className="rounded-control bg-danger-50 px-3 py-2 text-sm text-danger-700">
            {state.error}
          </p>
        )}

        <p className="text-xs text-ink-500">
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
