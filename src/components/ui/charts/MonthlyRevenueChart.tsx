"use client";

import { useState } from "react";
import { formatBRL } from "@/lib/format";
import { DayCalendarModal } from "./DayCalendarModal";

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
//
// Clicar num mês abre o calendário daquele mês (mesmo DayCalendarModal do
// gráfico por cliente) com o recebido por dia — dailyTotals vem pronto da
// página (getDailyRevenueBreakdown), sem chamada de rede no clique.
export function MonthlyRevenueChart({
  data,
  dailyTotals,
}: {
  data: MonthlyRevenuePoint[];
  dailyTotals: Record<string, Record<number, string>>;
}) {
  const [openMonthKey, setOpenMonthKey] = useState<string | null>(null);
  const max = Math.max(1, ...data.map((point) => Number(point.total)));
  const openPoint = data.find((point) => point.monthKey === openMonthKey);

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
              <button
                key={point.monthKey}
                type="button"
                onClick={() => setOpenMonthKey(point.monthKey)}
                title={`Ver dias de ${point.label}`}
                className="flex flex-1 flex-col items-center justify-end gap-1.5 rounded-control py-1 transition-colors hover:bg-surface-hover"
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
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-1.5 text-xs text-fg-subtle">
        Clique num mês para ver o valor por dia.{" "}
        <span className="sm:hidden">Arraste para o lado para ver mais →</span>
      </p>

      {openPoint && (
        <DayCalendarModal
          monthKey={openPoint.monthKey}
          monthLabel={openPoint.label}
          dailyTotals={dailyTotals[openPoint.monthKey] ?? {}}
          onClose={() => setOpenMonthKey(null)}
        />
      )}
    </div>
  );
}
