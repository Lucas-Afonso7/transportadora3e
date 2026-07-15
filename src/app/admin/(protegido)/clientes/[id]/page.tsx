import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdminSession } from "@/lib/auth/session";
import { getClientDetail } from "@/lib/data/admin-clients";
import { updateClientAction } from "../actions";
import { RegeneratePasswordButton } from "@/components/admin/RegeneratePasswordButton";
import { ServiceRow } from "@/components/admin/ServiceRow";
import { AddServiceForm } from "@/components/admin/AddServiceForm";

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
        className="mb-4 inline-block text-sm text-ink-500 hover:text-ink-900"
      >
        ← Clientes
      </Link>

      <h1 className="mb-1 text-2xl font-bold text-ink-900">{client.name}</h1>
      <p className="mb-6 text-sm text-ink-500">{client.docNumber}</p>

      {sucesso && SUCCESS_MESSAGES[sucesso] && (
        <p className="mb-6 rounded-control bg-brand-100 px-4 py-3 text-sm font-medium text-brand-700">
          {SUCCESS_MESSAGES[sucesso]}
        </p>
      )}
      {erro && (
        <p className="mb-6 rounded-control bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700">
          {ERROR_MESSAGES[erro] ?? "Não foi possível concluir a ação."}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-card border border-ink-200 bg-white p-5 shadow-card">
          <h2 className="mb-3 text-sm font-semibold text-ink-900">
            Dados do cliente
          </h2>
          <form action={updateClientAction} className="space-y-3">
            <input type="hidden" name="clientId" value={client.id} />

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-600">
                Nome
              </label>
              <input
                name="name"
                type="text"
                defaultValue={client.name}
                required
                className="w-full rounded-control border border-ink-300 px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-600">
                Telefone / WhatsApp
              </label>
              <input
                name="phone"
                type="text"
                defaultValue={client.phone}
                required
                className="w-full rounded-control border border-ink-300 px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-600">
                E-mail (opcional)
              </label>
              <input
                name="email"
                type="email"
                defaultValue={client.email ?? ""}
                className="w-full rounded-control border border-ink-300 px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <button
              type="submit"
              className="rounded-control bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Salvar
            </button>
          </form>
        </div>

        <div className="rounded-card border border-ink-200 bg-white p-5 shadow-card">
          <h2 className="mb-3 text-sm font-semibold text-ink-900">Acesso</h2>
          <p className="mb-3 text-sm text-ink-500">
            Login: <span className="font-medium text-ink-900">{client.docNumber}</span>
          </p>
          <RegeneratePasswordButton clientId={client.id} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-ink-900">
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
