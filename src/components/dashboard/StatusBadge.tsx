import { RouteStatus, type RouteStatusVariant } from "@/components/ui/RouteStatus";

type ServiceStatus = "PENDENTE" | "PARCIAL" | "PAGO";
type PaymentStatus = "AGUARDANDO_VALIDACAO" | "APROVADO" | "REJEITADO";

const SERVICE_VARIANT: Record<ServiceStatus, RouteStatusVariant> = {
  PENDENTE: "pendente",
  PARCIAL: "parcial",
  PAGO: "pago",
};

const PAYMENT_VARIANT: Record<PaymentStatus, RouteStatusVariant> = {
  AGUARDANDO_VALIDACAO: "pendente",
  APROVADO: "pago",
  REJEITADO: "rejeitado",
};

export function ServiceStatusBadge({
  status,
  paidAmount,
  totalAmount,
  size = "full",
}: {
  status: ServiceStatus;
  /** Só pra desenhar o quanto da trilha já foi pavimentado — não influencia
   *  nenhuma decisão de negócio (o status em si já vem calculado do
   *  servidor com Decimal, em computeRemainingAmount/service-status). */
  paidAmount?: string;
  totalAmount?: string;
  size?: "full" | "compact";
}) {
  const progress =
    paidAmount && totalAmount && Number(totalAmount) > 0
      ? (Number(paidAmount) / Number(totalAmount)) * 100
      : undefined;

  return (
    <RouteStatus
      variant={SERVICE_VARIANT[status]}
      progress={progress}
      size={size}
    />
  );
}

export function PaymentStatusBadge({
  status,
  size = "full",
}: {
  status: PaymentStatus;
  size?: "full" | "compact";
}) {
  return <RouteStatus variant={PAYMENT_VARIANT[status]} size={size} />;
}
