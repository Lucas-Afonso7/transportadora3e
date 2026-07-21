import { formatBRL } from "@/lib/format";

export type MonthlyRevenuePoint = {
  monthKey: string;
  label: string;
  total: string;
};

const CHART_HEIGHT_PX = 128;
const COLUMN_WIDTH_PX = 76;

// Gráfico de barras em CSS puro (sem SVG, sem biblioteca) — mesmo espírito
// do RouteStatus. Cada barra mostra o valor exato em texto visível acima
// dela; a altura é só reforço visual, nunca a única forma de ler o número.
// Largura mínima fixa por coluna (com rolagem de lado em telas estreitas,
// igual à Table) — sem isso o valor em R$ espreme e sobrepõe o vizinho.
export function MonthlyRevenueChart({ data }: { data: MonthlyRevenuePoint[] }) {
  const max = Math.max(1, ...data.map((point) => Number(point.total)));

  return (
    <div>
      <div className="overflow-x-auto">
        <div
          className="flex items-end gap-2 px-1"
          style={{ height: CHART_HEIGHT_PX + 56, minWidth: data.length * COLUMN_WIDTH_PX }}
        >
          {data.map((point) => {
            const value = Number(point.total);
            const heightPx =
              value > 0 ? Math.max(4, (value / max) * CHART_HEIGHT_PX) : 2;

            return (
              <div
                key={point.monthKey}
                className="flex flex-1 flex-col items-center justify-end gap-1.5"
                style={{ minWidth: COLUMN_WIDTH_PX - 8 }}
              >
                <span className="font-mono text-xs leading-tight whitespace-nowrap text-fg-muted">
                  {formatBRL(point.total)}
                </span>
                <div
                  className={`w-full max-w-8 rounded-t-sm ${value > 0 ? "bg-brand-500" : "bg-border"}`}
                  style={{ height: heightPx }}
                />
                <span className="text-xs font-medium text-fg-subtle">
                  {point.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-1.5 text-xs text-fg-subtle sm:hidden">
        Arraste para o lado para ver mais →
      </p>
    </div>
  );
}
