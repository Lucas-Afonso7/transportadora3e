import { requireClientSession } from "@/lib/auth/session";
import {
  getClientServiceSummaries,
  getClientPaymentHistory,
  summarizeClientTotals,
} from "@/lib/data/client-dashboard";
import { formatBRL } from "@/lib/format";
import { SummaryStat } from "@/components/dashboard/SummaryStat";
import { ServiceCard } from "@/components/dashboard/ServiceCard";
import { PaymentHistoryItem } from "@/components/dashboard/PaymentHistoryItem";

export default async function PainelPage({
  searchParams,
}: {
  searchParams: Promise<{ pagamento?: string }>;
}) {
  const client = await requireClientSession();
  const { pagamento } = await searchParams;

  // clientId vem só da sessão validada no servidor — nunca de query param
  // ou body enviado pelo navegador, então um cliente não tem como pedir
  // dados de outro trocando um ID na requisição.
  const [services, paymentHistory] = await Promise.all([
    getClientServiceSummaries(client.id),
    getClientPaymentHistory(client.id),
  ]);
  const totals = summarizeClientTotals(services);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">
          Olá, {client.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Aqui estão seus serviços e pagamentos com a Transportadora 3E.
        </p>
      </div>

      {pagamento === "enviado" && (
        <p className="rounded-control bg-brand-100 px-4 py-3 text-sm font-medium text-brand-700">
          Pagamento enviado! Assim que o Evaldo confirmar, o status aqui é
          atualizado.
        </p>
      )}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryStat label="Total devido" value={formatBRL(totals.totalDevido)} />
        <SummaryStat
          label="Já pago"
          value={formatBRL(totals.totalPago)}
          tone="brand"
        />
        <SummaryStat
          label="Aguardando validação"
          value={formatBRL(totals.totalAguardandoValidacao)}
        />
        <SummaryStat
          label="Em aberto"
          value={formatBRL(totals.totalEmAberto)}
          tone="warning"
        />
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-ink-900">
          Serviços contratados
        </h2>
        {services.length === 0 ? (
          <p className="text-sm text-ink-500">
            Nenhum serviço cadastrado ainda.
          </p>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-ink-900">
          Histórico de pagamentos
        </h2>
        {paymentHistory.length === 0 ? (
          <p className="text-sm text-ink-500">
            Você ainda não enviou nenhum pagamento.
          </p>
        ) : (
          <div className="space-y-3">
            {paymentHistory.map((payment) => (
              <PaymentHistoryItem key={payment.id} payment={payment} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
