import { requireAdminSession } from "@/lib/auth/session";
import { adminLogoutAction } from "@/lib/auth/logout-actions";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdminSession();

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-800 bg-ink-950">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-page-x py-3">
          <div>
            <span className="block text-xs font-medium uppercase tracking-wide text-brand-300">
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
        <div className="mx-auto max-w-5xl px-page-x pb-3">
          <AdminNav />
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-page-x py-8">{children}</div>
    </div>
  );
}
