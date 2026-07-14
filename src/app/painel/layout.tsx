import { requireClientSession } from "@/lib/auth/session";
import { clientLogoutAction } from "@/lib/auth/logout-actions";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = await requireClientSession();

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-page-x py-4">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-brand-600">
              Transportadora 3E
            </span>
            <p className="text-sm text-ink-500">Olá, {client.name}</p>
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
      </header>
      <div className="mx-auto max-w-3xl px-page-x py-8">{children}</div>
    </div>
  );
}
