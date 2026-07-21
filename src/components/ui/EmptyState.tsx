import type { LucideIcon } from "lucide-react";

// Estado vazio com voz própria — em vez de uma linha de texto cinza
// solta na tela, ícone + título + explicação curta do que aquilo
// significa (ex.: "tudo em dia" é uma notícia boa, não um vazio).
export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border px-6 py-10 text-center">
      <Icon className="h-6 w-6 text-fg-subtle" strokeWidth={1.5} />
      <p className="text-sm font-medium text-fg">{title}</p>
      {description && (
        <p className="max-w-xs text-xs text-fg-muted">{description}</p>
      )}
    </div>
  );
}
