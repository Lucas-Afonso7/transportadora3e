import { requireAdminSession } from "@/lib/auth/session";

export default async function AdminDashboardPage() {
  const admin = await requireAdminSession();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink-900">
        Olá, {admin.name.split(" ")[0]}
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        A fila de comprovantes pendentes e a visão financeira entram nas
        próximas etapas.
      </p>
    </div>
  );
}
