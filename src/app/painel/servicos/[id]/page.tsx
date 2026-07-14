import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireClientSession } from "@/lib/auth/session";
import { computeRemainingAmount } from "@/lib/payments";
import { getBusinessProfile } from "@/lib/data/business-profile";
import { PaymentForm } from "./PaymentForm";

export default async function PagarServicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const client = await requireClientSession();
  const { id } = await params;
  const serviceId = Number(id);

  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    notFound();
  }

  // Mesma regra de isolamento das outras telas: o serviço só é carregado
  // se pertencer ao cliente da sessão. Um ID de serviço de outro cliente
  // resulta em 404, igual a um ID que não existe.
  const service = await prisma.service.findFirst({
    where: { id: serviceId, clientId: client.id },
    include: { payments: { select: { amount: true, status: true } } },
  });

  if (!service) {
    notFound();
  }

  const remaining = computeRemainingAmount(service.totalAmount, service.payments);

  if (remaining.lte(0)) {
    notFound();
  }

  const businessProfile = await getBusinessProfile();

  return (
    <div className="mx-auto max-w-md">
      <PaymentForm
        service={{
          id: service.id,
          description: service.description,
          remainingAmount: remaining.toString(),
        }}
        businessProfile={{
          pixKey: businessProfile.pixKey,
          whatsappPhone: businessProfile.whatsappPhone,
        }}
      />
    </div>
  );
}
