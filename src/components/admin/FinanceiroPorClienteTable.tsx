"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatBRL } from "@/lib/format";
import { matchesDigits, matchesText } from "@/lib/search-match";
import { SearchInput } from "./SearchInput";
import type { ClientFinancialRow } from "@/lib/data/admin-finance";

export function FinanceiroPorClienteTable({
  porCliente,
}: {
  porCliente: ClientFinancialRow[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return porCliente;

    return porCliente.filter(
      (row) =>
        matchesText(row.clientName, trimmed) ||
        matchesDigits(row.clientDocNumber, trimmed),
    );
  }, [porCliente, query]);

  return (
    <div>
      <div className="mb-4 max-w-sm">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar por nome ou CPF/CNPJ..."
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-fg-muted">
          Nenhum cliente encontrado para &quot;{query}&quot;.
        </p>
      ) : (
        <div>
          <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-card">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-border-muted text-fg-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                    Contratado
                  </th>
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                    Recebido
                  </th>
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                    Em aberto
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted">
                {filtered.map((row) => (
                  <tr key={row.clientId} className="hover:bg-surface-hover">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link
                        href={`/admin/clientes/${row.clientId}`}
                        className="font-medium text-brand-700 hover:underline dark:text-brand-400"
                      >
                        {row.clientName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap text-fg">
                      {formatBRL(row.totalContratado)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap text-brand-700 dark:text-brand-400">
                      {formatBRL(row.totalPago)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap font-medium text-warning-700 dark:text-warning-500">
                      {formatBRL(row.totalPendente)}
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
