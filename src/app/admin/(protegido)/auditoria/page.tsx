import { Inbox } from "lucide-react";
import { requireAdminSession } from "@/lib/auth/session";
import { getAuditLog } from "@/lib/data/admin-audit";
import { AuditoriaTable } from "@/components/admin/AuditoriaTable";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AuditoriaPage() {
  await requireAdminSession();
  const entries = await getAuditLog();

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl text-fg">Auditoria</h1>
      <p className="mb-6 text-sm text-fg-muted">
        Histórico completo de todas as mudanças de status de pagamento —
        quem fez, quando, e o valor antes/depois.
      </p>

      {entries.length === 0 ? (
        <EmptyState icon={Inbox} title="Nenhum evento registrado ainda" />
      ) : (
        <AuditoriaTable entries={entries} />
      )}
    </div>
  );
}
