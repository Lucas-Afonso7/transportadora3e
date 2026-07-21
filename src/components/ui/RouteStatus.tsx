export type RouteStatusVariant = "pendente" | "parcial" | "pago" | "rejeitado";

// Elemento de assinatura do app: a estrada tracejada da logo da 3E vira
// o indicador de status. A trilha "pavimenta" conforme o pagamento
// avança — pendente é toda tracejada (nada percorrido), parcial pavimenta
// até onde já foi pago, pago é uma linha sólida de ponta a ponta,
// rejeitado é a trilha bloqueada (vermelha, apagada). Tudo ao redor do
// app fica quieto de propósito — esse é o único elemento com esse tanto
// de personalidade.
const LABEL: Record<RouteStatusVariant, string> = {
  pendente: "Pendente",
  parcial: "Parcial",
  pago: "Pago",
  rejeitado: "Rejeitado",
};

const LABEL_TEXT_TONE: Record<RouteStatusVariant, string> = {
  pendente: "text-fg-muted",
  parcial: "text-brand-tint-fg",
  pago: "text-brand-tint-fg",
  rejeitado: "text-danger-tint-fg",
};

export function RouteStatus({
  variant,
  progress,
  size = "full",
}: {
  variant: RouteStatusVariant;
  /** 0-100, só usado quando variant === "parcial" (pendente/pago/rejeitado já têm posição fixa). */
  progress?: number;
  size?: "full" | "compact";
}) {
  const fill =
    variant === "pago"
      ? 100
      : variant === "pendente" || variant === "rejeitado"
        ? 0
        : Math.max(6, Math.min(94, progress ?? 50));

  const startFilled = variant !== "pendente";
  const endFilled = variant === "pago";
  const blocked = variant === "rejeitado";

  const trackWidthClass = size === "compact" ? "w-8" : "w-20";
  const dotTone = blocked ? "bg-danger-500" : "bg-brand-500";

  return (
    <span
      className="inline-flex items-center gap-2"
      role="img"
      aria-label={`Status: ${LABEL[variant]}`}
    >
      <span className="flex shrink-0 items-center gap-1.5">
        <span
          className={`h-[7px] w-[7px] shrink-0 rounded-full ${startFilled ? dotTone : "bg-asfalto"}`}
        />
        <span
          className={`relative ${trackWidthClass} h-[3px] shrink-0 rounded-full bg-[repeating-linear-gradient(to_right,var(--color-asfalto)_0_4px,transparent_4px_8px)] ${blocked ? "opacity-40" : ""}`}
        >
          {!blocked && (
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-brand-500"
              style={{ width: `${fill}%` }}
            />
          )}
        </span>
        <span
          className={`h-[7px] w-[7px] shrink-0 rounded-full ${endFilled ? dotTone : blocked ? "bg-danger-500" : "bg-asfalto"}`}
        />
      </span>
      {size === "full" && (
        <span className={`text-xs font-medium ${LABEL_TEXT_TONE[variant]}`}>
          {LABEL[variant]}
        </span>
      )}
    </span>
  );
}
