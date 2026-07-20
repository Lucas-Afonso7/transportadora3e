"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AdminNav } from "./AdminNav";
import { SettingsMenu } from "@/components/SettingsMenu";

export function AdminSidebar({
  adminName,
  logoutAction,
}: {
  adminName: string;
  logoutAction: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  const header = (
    <div className="flex items-start justify-between gap-2">
      <div>
        <span className="block text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
          Transportadora 3E · Admin
        </span>
        <p className="mt-1 text-sm text-fg-muted">Olá, {adminName}</p>
      </div>
      <SettingsMenu logoutAction={logoutAction} />
    </div>
  );

  return (
    <>
      {/* Barra mobile: a sidebar de verdade (abaixo) só aparece a partir
          de md; nas telas menores ela vira um drawer acionado por esse
          botão, mesmo padrão de colapso usado no resto do app pra nav
          que não cabe na largura da tela. */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-page-x py-3 md:hidden">
        <span className="text-sm font-semibold text-fg">
          Transportadora 3E · Admin
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="flex h-8 w-8 items-center justify-center rounded-control border border-border text-fg-muted hover:border-fg-subtle hover:text-fg"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {/* Sidebar fixa, altura toda da tela, acompanha o scroll do
          conteúdo (sticky) — só visível a partir de md. */}
      <aside className="hidden w-60 shrink-0 flex-col gap-6 border-r border-border bg-surface p-4 md:sticky md:top-0 md:flex md:h-screen md:overflow-y-auto">
        {header}
        <AdminNav />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col gap-6 bg-surface p-4 shadow-card">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="flex h-8 w-8 items-center justify-center rounded-control border border-border text-fg-muted hover:border-fg-subtle hover:text-fg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {header}
            <AdminNav onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
