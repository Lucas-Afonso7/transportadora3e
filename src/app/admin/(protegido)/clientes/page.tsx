import Link from "next/link";
import { Users } from "lucide-react";
import { requireAdminSession } from "@/lib/auth/session";
import { getAllClients } from "@/lib/data/admin-clients";
import { ClientesTable } from "@/components/admin/ClientesTable";
import { EmptyState } from "@/components/ui/EmptyState";

const ERROR_MESSAGES: Record<string, string> = {
  dados_invalidos: "Dados inválidos.",
  cliente_nao_encontrado: "Cliente não encontrado.",
};

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  await requireAdminSession();
  const { erro } = await searchParams;
  const clients = await getAllClients();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-fg">Clientes</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {clients.length} cliente{clients.length === 1 ? "" : "s"}{" "}
            cadastrado{clients.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Link
          href="/admin/clientes/novo"
          className="rounded-control bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Novo Cliente
        </Link>
      </div>

      {erro && (
        <p className="mb-6 rounded-control bg-danger-tint px-4 py-3 text-sm font-medium text-danger-tint-fg">
          {ERROR_MESSAGES[erro] ?? "Não foi possível concluir a ação."}
        </p>
      )}

      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum cliente cadastrado ainda"
          description='Clique em "Novo Cliente" para cadastrar o primeiro.'
        />
      ) : (
        <ClientesTable clients={clients} />
      )}
    </div>
  );
}
