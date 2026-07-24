"use client";

import { ArrowUpDown } from "lucide-react";

export type SortOption<T extends string> = { value: T; label: string };

// Genérico de propósito — mesma ideia do SearchInput, já reutilizado em
// várias tabelas do admin. Só um <select> nativo (mais simples e mais
// acessível que montar um dropdown customizado pra essa necessidade).
export function SortSelect<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: SortOption<T>[];
}) {
  return (
    <div className="relative">
      <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-label="Ordenar por"
        className="w-full appearance-none rounded-control border border-border bg-page py-2 pr-8 pl-9 text-sm text-fg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
