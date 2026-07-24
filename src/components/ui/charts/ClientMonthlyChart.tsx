import { formatBRL } from "@/lib/format";

export type ClientMonthlyPoint = {
  monthKey: string;
  label: string;
  contratado: string;
  pago: string;
  devido: string;
};

const BAR_HEIGHT_PX = 56;
const COLUMN_WIDTH_PX = 128;

// Mesmo espírito do MonthlyRevenueChart (CSS puro, sem lib), mas com 3
// séries por mês em vez de uma: contratado (neutro), pago (brand) e devido
// (warning) — mesmas cores dos cards de resumo da própria página, pra ficar
// óbvio qual barra é qual sem precisar decorar uma legenda nova. Valor
// exato sempre em texto, nunca só a barra.
export function ClientMonthlyChart({ data }: { data: ClientMonthlyPoint[] }) {
  const max = Math.max(
    1,
    ...data.flatMap((point) => [
      Number(point.contratado),
      Number(point.pago),
      Number(point.devido),
    ]),
  );

  return (
    <div>
      <div className="overflow-x-auto">
        <div
          className="flex gap-3 px-1"
          style={{ minWidth: data.length * COLUMN_WIDTH_PX }}
        >
          {data.map((point) => {
            const bars = [
              { key: "contratado", value: point.contratado, className: "bg-ink-400 dark:bg-ink-500" },
              { key: "pago", value: point.pago, className: "bg-brand-500" },
              { key: "devido", value: point.devido, className: "bg-warning-500" },
            ];

            return (
              <div
                key={point.monthKey}
                className="flex flex-col items-center gap-2 rounded-control border border-border-muted p-2"
                style={{ minWidth: COLUMN_WIDTH_PX - 12 }}
              >
                <div
                  className="flex items-end gap-1.5"
                  style={{ height: BAR_HEIGHT_PX }}
                >
                  {bars.map((bar) => {
                    const value = Number(bar.value);
                    const height =
                      value > 0 ? Math.max(3, (value / max) * BAR_HEIGHT_PX) : 1;
                    return (
                      <div
                        key={bar.key}
                        className={`w-3 rounded-t-sm ${value > 0 ? bar.className : "bg-border"}`}
                        style={{ height }}
                      />
                    );
                  })}
                </div>

                <p className="text-xs font-medium text-fg-subtle">
                  {point.label}
                </p>

                <div className="w-full space-y-0.5 border-t border-border-muted pt-1.5 font-mono text-[10px]">
                  <p className="flex justify-between gap-1 text-fg-muted">
                    <span>Contrat.</span>
                    <span>{formatBRL(point.contratado)}</span>
                  </p>
                  <p className="flex justify-between gap-1 text-brand-700 dark:text-brand-400">
                    <span>Pago</span>
                    <span>{formatBRL(point.pago)}</span>
                  </p>
                  <p className="flex justify-between gap-1 text-warning-700 dark:text-warning-500">
                    <span>Devido</span>
                    <span>{formatBRL(point.devido)}</span>
                  </p>
                </div>
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
