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
    <nav className="flex items-center gap-1">
      {LINKS.map((link) => {
        const isActive =
          link.href === "/painel"
            ? pathname === "/painel"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-control px-3 py-1.5 text-sm font-medium transition-colors ${
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
