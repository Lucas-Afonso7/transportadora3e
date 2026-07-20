import Link from "next/link";
import { requireAdminSession } from "@/lib/auth/session";
import { getAllClients } from "@/lib/data/admin-clients";
import { formatBRL } from "@/lib/format";

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
          <h1 className="text-2xl font-bold text-fg">Clientes</h1>
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
        <p className="text-sm text-fg-muted">Nenhum cliente cadastrado ainda.</p>
      ) : (
        <div>
        <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border-muted text-fg-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  CPF/CNPJ
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Telefone
                </th>
                <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                  Contratado
                </th>
                <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                  Em aberto
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-surface-hover">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={`/admin/clientes/${client.id}`}
                      className="font-medium text-brand-700 hover:underline dark:text-brand-400"
                    >
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-fg-muted">
                    {client.docNumber}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-fg-muted">
                    {client.phone}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap text-fg">
                    {formatBRL(client.totalContratado)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap font-medium text-warning-700 dark:text-warning-500">
                    {formatBRL(client.totalPendente)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-1.5 text-xs text-fg-subtle sm:hidden">
          Arraste para o lado para ver mais →
        </p>
        </div>
      )}
    </div>
  );
}
