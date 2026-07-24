"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { buildMonthGrid } from "@/lib/calendar-grid";

const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function DayCalendarModal({
  monthKey,
  monthLabel,
  dailyTotals,
  onClose,
}: {
  monthKey: string;
  monthLabel: string;
  /** dia do mês -> valor total naquele dia; dias sem frete não aparecem aqui */
  dailyTotals: Record<number, string>;
  onClose: () => void;
}) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const cells = buildMonthGrid(monthKey);
  const selectedTotal = selectedDay !== null ? (dailyTotals[selectedDay] ?? "0") : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-calendar-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-card border border-border border-t-2 border-t-brand-500 bg-surface p-5 shadow-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2
            id="day-calendar-title"
            className="font-display text-lg text-fg capitalize"
          >
            {monthLabel}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-fg-subtle hover:text-fg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-fg-subtle">
          {WEEKDAY_LABELS.map((label, i) => (
            <div key={i}>{label}</div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />;

            const total = dailyTotals[day];
            const hasMovement = total !== undefined && Number(total) > 0;
            const isSelected = selectedDay === day;

            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedDay(day)}
                title={hasMovement ? `Dia ${day}: ${formatBRL(total)}` : undefined}
                className={`relative flex h-9 items-center justify-center rounded-control text-sm ${
                  isSelected
                    ? "bg-brand-600 font-semibold text-white"
                    : hasMovement
                      ? "bg-brand-tint font-medium text-brand-tint-fg hover:bg-brand-100 dark:hover:bg-brand-900"
                      : "text-fg-muted hover:bg-surface-hover"
                }`}
              >
                {day}
                {hasMovement && !isSelected && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-brand-500" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-control border border-border-muted bg-page px-4 py-3">
          {selectedDay !== null ? (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
                Dia {selectedDay}
              </p>
              <p className="font-mono mt-1 text-lg font-semibold text-fg">
                {formatBRL(selectedTotal ?? "0")}
              </p>
              {(!selectedTotal || Number(selectedTotal) === 0) && (
                <p className="mt-0.5 text-xs text-fg-subtle">
                  Nenhum frete nesse dia.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-fg-muted">
              Selecione um dia pra ver o valor movimentado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
