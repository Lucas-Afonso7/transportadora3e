import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdminSession } from "@/lib/auth/session";
import { getClientDetail } from "@/lib/data/admin-clients";
import { updateClientAction } from "../actions";
import { RegeneratePasswordButton } from "@/components/admin/RegeneratePasswordButton";
import { ServiceRow } from "@/components/admin/ServiceRow";
import { AddServiceForm } from "@/components/admin/AddServiceForm";
import { Card } from "@/components/ui/Card";

const ERROR_MESSAGES: Record<string, string> = {
  dados_invalidos: "Dados inválidos.",
  email_invalido: "E-mail inválido.",
  valor_invalido: "Valor inválido — use até 2 casas decimais.",
  data_invalida: "Data inválida.",
  valor_abaixo_do_pago:
    "O valor total não pode ficar abaixo do que já foi aprovado para esse serviço.",
};

const SUCCESS_MESSAGES: Record<string, string> = {
  cliente_atualizado: "Dados do cliente atualizados.",
  servico_criado: "Serviço adicionado.",
  servico_atualizado: "Serviço atualizado.",
};

export default async function ClienteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sucesso?: string; erro?: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;
  const { sucesso, erro } = await searchParams;

  const clientId = Number(id);
  if (!Number.isInteger(clientId) || clientId <= 0) {
    notFound();
  }

  const client = await getClientDetail(clientId);
  if (!client) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/clientes"
        className="mb-4 inline-block text-sm text-fg-muted hover:text-fg"
      >
        ← Clientes
      </Link>

      <h1 className="font-display mb-1 text-2xl text-fg">{client.name}</h1>
      <p className="font-mono mb-6 text-sm text-fg-muted">{client.docNumber}</p>

      {sucesso && SUCCESS_MESSAGES[sucesso] && (
        <p className="mb-6 rounded-control bg-brand-tint px-4 py-3 text-sm font-medium text-brand-tint-fg">
          {SUCCESS_MESSAGES[sucesso]}
        </p>
      )}
      {erro && (
        <p className="mb-6 rounded-control bg-danger-tint px-4 py-3 text-sm font-medium text-danger-tint-fg">
          {ERROR_MESSAGES[erro] ?? "Não foi possível concluir a ação."}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padding="lg">
          <h2 className="font-display mb-3 text-sm text-fg">
            Dados do cliente
          </h2>
          <form action={updateClientAction} className="space-y-3">
            <input type="hidden" name="clientId" value={client.id} />

            <div>
              <label className="mb-1 block text-xs font-medium text-fg-muted">
                Nome
              </label>
              <input
                name="name"
                type="text"
                defaultValue={client.name}
                required
                className="w-full rounded-control border border-border bg-page px-3 py-2 text-sm text-fg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-fg-muted">
                Telefone / WhatsApp
              </label>
              <input
                name="phone"
                type="text"
                defaultValue={client.phone}
                required
                className="w-full rounded-control border border-border bg-page px-3 py-2 text-sm text-fg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-fg-muted">
                E-mail (opcional)
              </label>
              <input
                name="email"
                type="email"
                defaultValue={client.email ?? ""}
                className="w-full rounded-control border border-border bg-page px-3 py-2 text-sm text-fg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
              />
            </div>

            <button
              type="submit"
              className="rounded-control bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Salvar
            </button>
          </form>
        </Card>

        <Card padding="lg">
          <h2 className="font-display mb-3 text-sm text-fg">Acesso</h2>
          <p className="mb-3 text-sm text-fg-muted">
            Login:{" "}
            <span className="font-mono font-medium text-fg">
              {client.docNumber}
            </span>
          </p>
          <RegeneratePasswordButton clientId={client.id} />
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="font-display mb-3 text-base text-fg">
          Serviços contratados
        </h2>
        <div className="space-y-3">
          {client.services.map((service) => (
            <ServiceRow key={service.id} service={service} />
          ))}
          <AddServiceForm clientId={client.id} />
        </div>
      </div>
    </div>
  );
}
