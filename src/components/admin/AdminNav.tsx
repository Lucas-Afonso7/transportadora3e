"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Comprovantes" },
  { href: "/admin/financeiro", label: "Financeiro" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/auditoria", label: "Auditoria" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    // overflow-x-auto + whitespace-nowrap: com 4 itens, o menu não cabe em
    // 390px de largura — em vez de estourar a página inteira (o que
    // aconteceu antes dessa correção), ele mesmo vira um carrossel
    // horizontal curto, sem afetar o resto do layout.
    <nav className="flex items-center gap-1 overflow-x-auto">
      {LINKS.map((link) => {
        const isActive =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 whitespace-nowrap rounded-control px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-ink-800 text-white"
                : "text-ink-300 hover:bg-ink-900 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
