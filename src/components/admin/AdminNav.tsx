"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Comprovantes" },
  { href: "/admin/financeiro", label: "Financeiro" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/auditoria", label: "Auditoria" },
];

// onNavigate: usado pelo drawer mobile da sidebar pra fechar o menu ao
// escolher um link — no desktop (sidebar sempre visível) fica undefined
// e o clique não faz nada além de navegar.
export function AdminNav({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {LINKS.map((link) => {
        const isActive =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={`font-display rounded-control px-3 py-2 text-sm transition-colors ${
              isActive
                ? "bg-brand-tint text-brand-tint-fg"
                : "text-fg-muted hover:bg-surface-hover hover:text-fg"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
