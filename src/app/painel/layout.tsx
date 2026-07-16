import Image from "next/image";
import { requireClientSession } from "@/lib/auth/session";
import { clientLogoutAction } from "@/lib/auth/logout-actions";
import { PainelNav } from "@/components/painel/PainelNav";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = await requireClientSession();

  return (
    <div className="min-h-screen bg-page">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-page-x py-3">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-3e.png"
              alt="Transportadora 3E"
              width={32}
              height={32}
              className="rounded"
            />
            <div>
              <span className="block text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
                Transportadora 3E
              </span>
              <p className="text-sm text-fg-muted">Olá, {client.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <form action={clientLogoutAction}>
              <button
                type="submit"
                className="text-sm font-medium text-fg-muted hover:text-fg"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-page-x pb-3">
          <PainelNav />
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-page-x py-8">{children}</div>
    </div>
  );
}
