"use client";

import { useMemo, useState } from "react";
import { formatBRL, formatDateTime, formatTime } from "@/lib/format";
import { matchesText } from "@/lib/search-match";
import { SearchInput } from "./SearchInput";
import type { AuditLogEntry } from "@/lib/data/admin-audit";

const ACTION_LABEL: Record<string, string> = {
  CRIADO: "Enviado pelo cliente",
  APROVADO: "Aprovado",
  REJEITADO: "Rejeitado",
  REENVIADO: "Reenviado",
};

const ACTION_STYLE: Record<string, string> = {
  CRIADO: "bg-info-tint text-info-tint-fg",
  APROVADO: "bg-brand-tint text-brand-tint-fg",
  REJEITADO: "bg-danger-tint text-danger-tint-fg",
  REENVIADO: "bg-info-tint text-info-tint-fg",
};

export function AuditoriaTable({ entries }: { entries: AuditLogEntry[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return entries;

    return entries.filter(
      (entry) =>
        matchesText(entry.clientName, trimmed) ||
        matchesText(entry.serviceDescription, trimmed) ||
        matchesText(entry.actorLabel, trimmed) ||
        matchesText(ACTION_LABEL[entry.action] ?? entry.action, trimmed),
    );
  }, [entries, query]);

  return (
    <div>
      <div className="mb-4 max-w-sm">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar por cliente, serviço ou quem fez..."
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-fg-muted">
          Nenhum evento encontrado para &quot;{query}&quot;.
        </p>
      ) : (
        <div>
          <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-card">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-border-muted text-fg-muted">
                <tr>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">
                    Quando
                  </th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">
                    Evento
                  </th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">
                    Quem
                  </th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">
                    Cliente
                  </th>
                  <th className="px-4 py-3 font-medium">Serviço</th>
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted">
                {filtered.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-fg-muted">
                      {formatDateTime(entry.createdAt)} às{" "}
                      {formatTime(entry.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${ACTION_STYLE[entry.action] ?? ""}`}
                      >
                        {ACTION_LABEL[entry.action] ?? entry.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-fg">
                      {entry.actorLabel}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-fg-muted">
                      {entry.clientName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-fg-muted">
                      {entry.serviceDescription}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap font-medium text-fg">
                      {entry.amountBefore &&
                      entry.amountBefore !== entry.amountAfter ? (
                        <span className="text-xs text-fg-subtle">
                          {formatBRL(entry.amountBefore)} →{" "}
                        </span>
                      ) : null}
                      {formatBRL(entry.amountAfter)}
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
