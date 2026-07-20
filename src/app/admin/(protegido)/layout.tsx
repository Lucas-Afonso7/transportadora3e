import { requireAdminSession } from "@/lib/auth/session";
import { adminLogoutAction } from "@/lib/auth/logout-actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { AutoRefresh } from "@/components/AutoRefresh";
import { SettingsMenu } from "@/components/SettingsMenu";
import { AdminNotificationWatcher } from "@/components/admin/AdminNotificationWatcher";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdminSession();

  return (
    <div className="min-h-screen bg-page">
      <AutoRefresh />
      <AdminNotificationWatcher />
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-page-x py-3">
          <div>
            <span className="block text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
              Transportadora 3E · Admin
            </span>
            <p className="text-sm text-fg-muted">Olá, {admin.name}</p>
          </div>
          <SettingsMenu logoutAction={adminLogoutAction} />
        </div>
        <div className="mx-auto max-w-6xl px-page-x pb-3">
          <AdminNav />
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-page-x py-8">{children}</div>
    </div>
  );
}
