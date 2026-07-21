"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/painel", label: "Dashboard" },
  { href: "/painel/em-aberto", label: "Em Aberto" },
  { href: "/painel/extrato", label: "Extrato" },
];

export function PainelNav() {
  const pathname = usePathname();

  return (
    // overflow-x-auto: se um item novo for adicionado no futuro e não
    // couber em telas pequenas, o menu vira carrossel horizontal em vez de
    // estourar a largura da página inteira.
    <nav className="flex items-center gap-1 overflow-x-auto">
      {LINKS.map((link) => {
        const isActive =
          link.href === "/painel"
            ? pathname === "/painel"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`font-display shrink-0 whitespace-nowrap rounded-control px-3 py-1.5 text-sm transition-colors ${
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
