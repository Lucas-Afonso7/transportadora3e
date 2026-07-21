export type PaymentStatusCount = {
  status: "AGUARDANDO_VALIDACAO" | "APROVADO" | "REJEITADO";
  count: number;
};

const LABEL: Record<PaymentStatusCount["status"], string> = {
  AGUARDANDO_VALIDACAO: "Aguardando validação",
  APROVADO: "Aprovado",
  REJEITADO: "Rejeitado",
};

const BAR_TONE: Record<PaymentStatusCount["status"], string> = {
  AGUARDANDO_VALIDACAO: "bg-info-500",
  APROVADO: "bg-brand-500",
  REJEITADO: "bg-danger-500",
};

const DOT_TONE: Record<PaymentStatusCount["status"], string> = {
  AGUARDANDO_VALIDACAO: "bg-info-500",
  APROVADO: "bg-brand-500",
  REJEITADO: "bg-danger-500",
};

// Barra empilhada (proporção visual) + legenda com a contagem exata de cada
// status — a barra é só reforço, a legenda em texto é a fonte confiável do
// número.
export function PaymentStatusChart({ data }: { data: PaymentStatusCount[] }) {
  const total = data.reduce((acc, d) => acc + d.count, 0);

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-border-muted">
        {total > 0 &&
          data
            .filter((d) => d.count > 0)
            .map((d) => (
              <div
                key={d.status}
                className={BAR_TONE[d.status]}
                style={{ width: `${(d.count / total) * 100}%` }}
              />
            ))}
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {data.map((d) => (
          <li key={d.status} className="flex items-center gap-1.5 text-xs">
            <span className={`h-2 w-2 shrink-0 rounded-full ${DOT_TONE[d.status]}`} />
            <span className="text-fg-muted">{LABEL[d.status]}</span>
            <span className="font-mono font-medium text-fg">{d.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
