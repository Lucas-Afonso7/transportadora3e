"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { matchesDigits, matchesText } from "@/lib/search-match";
import { SearchInput } from "./SearchInput";
import { Table } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import type { AdminClientSummary } from "@/lib/data/admin-clients";

export function ClientesTable({ clients }: { clients: AdminClientSummary[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return clients;

    return clients.filter(
      (client) =>
        matchesText(client.name, trimmed) ||
        matchesDigits(client.docNumber, trimmed) ||
        matchesDigits(client.phone, trimmed),
    );
  }, [clients, query]);

  return (
    <div>
      <div className="mb-4 max-w-sm">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar por nome, CPF/CNPJ ou telefone..."
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={`Nenhum cliente encontrado para "${query}"`}
        />
      ) : (
        <Table minWidth={640}>
          <thead className="border-b border-border-muted text-fg-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">
                CPF/CNPJ
              </th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">
                Telefone
              </th>
              <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                Contratado
              </th>
              <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                Em aberto
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-muted">
            {filtered.map((client) => (
              <tr key={client.id} className="hover:bg-surface-hover">
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link
                    href={`/admin/clientes/${client.id}`}
                    className="font-medium text-brand-700 hover:underline dark:text-brand-400"
                  >
                    {client.name}
                  </Link>
                </td>
                <td className="font-mono px-4 py-3 whitespace-nowrap text-fg-muted">
                  {client.docNumber}
                </td>
                <td className="font-mono px-4 py-3 whitespace-nowrap text-fg-muted">
                  {client.phone}
                </td>
                <td className="font-mono px-4 py-3 text-right whitespace-nowrap text-fg">
                  {formatBRL(client.totalContratado)}
                </td>
                <td className="font-mono px-4 py-3 text-right whitespace-nowrap font-medium text-warning-700 dark:text-warning-500">
                  {formatBRL(client.totalPendente)}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
