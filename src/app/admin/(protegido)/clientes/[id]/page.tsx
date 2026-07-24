import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdminSession } from "@/lib/auth/session";
import {
  getClientDetail,
  getClientMonthlyBreakdown,
  getClientLoginHistory,
} from "@/lib/data/admin-clients";
import { summarizeClientTotals } from "@/lib/data/client-dashboard";
import { updateClientAction } from "../actions";
import { RegeneratePasswordButton } from "@/components/admin/RegeneratePasswordButton";
import { ServiceRow } from "@/components/admin/ServiceRow";
import { AddServiceForm } from "@/components/admin/AddServiceForm";
import { Card } from "@/components/ui/Card";
import { ClientMonthlyChart } from "@/components/ui/charts/ClientMonthlyChart";
import { formatBRL, formatDateTime } from "@/lib/format";

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

  const totals = summarizeClientTotals(client.services);
  const monthly = getClientMonthlyBreakdown(client.services);
  const loginHistory = await getClientLoginHistory(clientId);

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

      {/* Resumo financeiro — sempre visível, mesmo com os dados cadastrais
          recolhidos abaixo. Reaproveita summarizeClientTotals, a mesma
          conta usada no dashboard do próprio cliente. */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
            Contratado
          </p>
          <p className="font-display mt-1 text-xl text-fg">
            {formatBRL(totals.totalDevido)}
          </p>
        </Card>
        <Card tone="brand">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-tint-fg">
            Pago
          </p>
          <p className="font-display mt-1 text-xl text-brand-tint-fg">
            {formatBRL(totals.totalPago)}
          </p>
        </Card>
        <Card tone="warning">
          <p className="text-xs font-medium uppercase tracking-wide text-warning-tint-fg">
            Em aberto
          </p>
          <p className="font-display mt-1 text-xl text-warning-tint-fg">
            {formatBRL(totals.totalEmAberto)}
          </p>
        </Card>
      </div>

      <Card className="mb-8">
        <h2 className="font-display mb-4 text-base text-fg">
          Evolução mensal
        </h2>
        <ClientMonthlyChart data={monthly} />
      </Card>

      {/* Dados cadastrais, acesso e histórico — recolhidos por padrão (só o
          nome do cliente já fica visível no H1 acima). <details> não pode
          usar o componente Card como raiz (renderiza div/Link), mas
          replica a mesma linguagem visual — mesmo padrão já usado em
          AddServiceForm/ServiceRow. */}
      <details className="mb-8 rounded-card border border-border border-t-2 border-t-border-muted bg-surface p-4 shadow-card">
        <summary className="cursor-pointer text-sm font-medium text-fg-muted hover:text-fg">
          Dados cadastrais, acesso e histórico de acessos
        </summary>

        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
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

          <div className="space-y-6">
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

            <Card padding="lg">
              <h2 className="font-display mb-3 text-sm text-fg">
                Histórico de acessos
              </h2>
              {loginHistory.length === 0 ? (
                <p className="text-sm text-fg-muted">
                  Nenhum acesso registrado ainda.
                </p>
              ) : (
                <ul className="max-h-64 space-y-1.5 overflow-y-auto text-sm">
                  {loginHistory.map((event) => (
                    <li
                      key={event.id}
                      className="flex items-center justify-between gap-2 border-b border-border-muted pb-1.5 last:border-0"
                    >
                      <span className="text-fg-muted">
                        {formatDateTime(event.createdAt)}
                      </span>
                      {event.ipAddress && (
                        <span className="font-mono text-xs text-fg-subtle">
                          {event.ipAddress}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </details>

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
