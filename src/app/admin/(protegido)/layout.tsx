import { requireAdminSession } from "@/lib/auth/session";
import { adminLogoutAction } from "@/lib/auth/logout-actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdminSession();

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-800 bg-ink-950">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-page-x py-4">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-brand-300">
              Transportadora 3E · Admin
            </span>
            <p className="text-sm text-ink-300">Olá, {admin.name}</p>
          </div>
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="text-sm font-medium text-ink-300 hover:text-white"
            >
              Sair
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-page-x py-8">{children}</div>
    </div>
  );
}
