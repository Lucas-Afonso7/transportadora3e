type ServiceStatus = "PENDENTE" | "PARCIAL" | "PAGO";
type PaymentStatus = "AGUARDANDO_VALIDACAO" | "APROVADO" | "REJEITADO";

const SERVICE_LABEL: Record<ServiceStatus, string> = {
  PENDENTE: "Pendente",
  PARCIAL: "Parcial",
  PAGO: "Pago",
};

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  AGUARDANDO_VALIDACAO: "Aguardando validação",
  APROVADO: "Aprovado",
  REJEITADO: "Rejeitado",
};

// Mesmas cores nos dois badges pra status equivalentes (pago = aprovado,
// pendente/parcial = aguardando, rejeitado = danger) — o cliente não deve
// aprender dois vocabulários visuais diferentes pro mesmo conceito.
const STYLE: Record<ServiceStatus | PaymentStatus, string> = {
  PENDENTE: "bg-warning-50 text-warning-700",
  PARCIAL: "bg-info-50 text-info-700",
  PAGO: "bg-brand-100 text-brand-700",
  AGUARDANDO_VALIDACAO: "bg-info-50 text-info-700",
  APROVADO: "bg-brand-100 text-brand-700",
  REJEITADO: "bg-danger-50 text-danger-700",
};

export function ServiceStatusBadge({ status }: { status: ServiceStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STYLE[status]}`}
    >
      {SERVICE_LABEL[status]}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STYLE[status]}`}
    >
      {PAYMENT_LABEL[status]}
    </span>
  );
}
