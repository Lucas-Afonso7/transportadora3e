"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  // null até montar no cliente — evita mismatch de hidratação, já que o
  // servidor não tem como saber a preferência salva no localStorage.
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    // Exceção deliberada à regra: isDark só pode ser lido depois de montar
    // (document não existe no SSR), e o placeholder acima (isDark === null)
    // já garante que o primeiro render do cliente bate com o do servidor —
    // sem esse setState aqui, nunca saímos do estado de placeholder.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
  }

  if (isDark === null) {
    return <div className="h-8 w-8" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      title={isDark ? "Tema claro" : "Tema escuro"}
      className="flex h-8 w-8 items-center justify-center rounded-control border border-border text-fg-muted transition-colors hover:border-fg-subtle hover:text-fg"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
