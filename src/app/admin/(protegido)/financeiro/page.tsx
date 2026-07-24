import { Inbox } from "lucide-react";
import { requireAdminSession } from "@/lib/auth/session";
import {
  getFinancialOverview,
  getMonthlyRevenue,
  getDailyRevenueBreakdown,
  getPaymentStatusBreakdown,
} from "@/lib/data/admin-finance";
import { formatBRL } from "@/lib/format";
import { FinanceiroPorClienteTable } from "@/components/admin/FinanceiroPorClienteTable";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { MonthlyRevenueChart } from "@/components/ui/charts/MonthlyRevenueChart";
import { PaymentStatusChart } from "@/components/ui/charts/PaymentStatusChart";

export default async function FinanceiroPage() {
  await requireAdminSession();
  const [{ overview, porCliente }, monthlyRevenue, dailyRevenue, statusBreakdown] =
    await Promise.all([
      getFinancialOverview(),
      getMonthlyRevenue(),
      getDailyRevenueBreakdown(),
      getPaymentStatusBreakdown(),
    ]);

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl text-fg">Financeiro</h1>
      <p className="mb-6 text-sm text-fg-muted">
        Visão geral de todos os clientes e serviços.
      </p>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
            Contratado
          </p>
          <p className="font-display mt-1 text-xl text-fg">
            {formatBRL(overview.totalContratado)}
          </p>
        </Card>
        <Card tone="brand">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-tint-fg">
            Recebido
          </p>
          <p className="font-display mt-1 text-xl text-brand-tint-fg">
            {formatBRL(overview.totalRecebido)}
          </p>
        </Card>
        <Card tone="warning">
          <p className="text-xs font-medium uppercase tracking-wide text-warning-tint-fg">
            Em aberto
          </p>
          <p className="font-display mt-1 text-xl text-warning-tint-fg">
            {formatBRL(overview.totalPendente)}
          </p>
        </Card>
        <Card tone="info">
          <p className="text-xs font-medium uppercase tracking-wide text-info-tint-fg">
            Parciais em aberto
          </p>
          <p className="font-display mt-1 text-xl text-info-tint-fg">
            {overview.servicosParciaisCount}
          </p>
          <p className="font-mono text-xs text-info-tint-fg">
            {formatBRL(overview.servicosParciaisValor)}
          </p>
        </Card>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <h2 className="font-display mb-4 text-base text-fg">
            Recebido por mês
          </h2>
          <MonthlyRevenueChart data={monthlyRevenue} dailyTotals={dailyRevenue} />
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="font-display mb-4 text-base text-fg">
            Pagamentos por status
          </h2>
          <PaymentStatusChart data={statusBreakdown} />
        </Card>
      </div>

      <h2 className="font-display mb-3 text-base text-fg">Por cliente</h2>

      {porCliente.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Nenhum cliente com serviços cadastrados ainda"
        />
      ) : (
        <FinanceiroPorClienteTable porCliente={porCliente} />
      )}
    </div>
  );
}
