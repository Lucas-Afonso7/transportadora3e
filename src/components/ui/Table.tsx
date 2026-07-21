import type { ReactNode } from "react";

// Único componente de tabela do app. `minWidth` controla o ponto em que
// a tabela passa a rolar de lado em telas estreitas — cada tela tem um
// número de colunas diferente, por isso é parâmetro em vez de fixo.
export function Table({
  children,
  minWidth = 560,
}: {
  children: ReactNode;
  minWidth?: number;
}) {
  return (
    <div>
      <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-card">
        <table className="w-full text-left text-sm" style={{ minWidth }}>
          {children}
        </table>
      </div>
      <p className="mt-1.5 text-xs text-fg-subtle sm:hidden">
        Arraste para o lado para ver mais →
      </p>
    </div>
  );
}
