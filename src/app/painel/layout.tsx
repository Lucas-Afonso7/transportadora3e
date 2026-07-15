import Image from "next/image";
import { requireClientSession } from "@/lib/auth/session";
import { clientLogoutAction } from "@/lib/auth/logout-actions";
import { PainelNav } from "@/components/painel/PainelNav";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = await requireClientSession();

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-200 bg-white">
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
              <span className="block text-xs font-medium uppercase tracking-wide text-brand-600">
                Transportadora 3E
              </span>
              <p className="text-sm text-ink-500">Olá, {client.name}</p>
            </div>
          </div>

          <form action={clientLogoutAction}>
            <button
              type="submit"
              className="text-sm font-medium text-ink-500 hover:text-ink-900"
            >
              Sair
            </button>
          </form>
        </div>
        <div className="mx-auto max-w-5xl px-page-x pb-3">
          <PainelNav />
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-page-x py-8">{children}</div>
    </div>
  );
}
