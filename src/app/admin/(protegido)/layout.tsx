import { requireAdminSession } from "@/lib/auth/session";
import { adminLogoutAction } from "@/lib/auth/logout-actions";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AutoRefresh } from "@/components/AutoRefresh";
import { AdminNotificationWatcher } from "@/components/admin/AdminNotificationWatcher";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdminSession();

  return (
    <div className="min-h-screen bg-page md:flex">
      <AutoRefresh />
      <AdminNotificationWatcher />
      <AdminSidebar adminName={admin.name} logoutAction={adminLogoutAction} />
      <main className="flex-1 px-page-x py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
