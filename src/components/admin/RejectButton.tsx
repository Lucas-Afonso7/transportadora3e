import { rejectPaymentAction } from "@/app/admin/(protegido)/actions";

// <details>/<summary> em vez de useState: o "revelar campo de motivo" não
// precisa de JavaScript nenhum (funciona com progressive enhancement),
// então isso continua um componente de servidor puro — sem client bundle
// extra só para abrir/fechar um campo de texto.
export function RejectButton({ paymentId }: { paymentId: number }) {
  return (
    <details className="w-full sm:w-auto">
      <summary className="inline-block cursor-pointer list-none rounded-control border border-danger-500 px-4 py-2 text-sm font-medium text-danger-tint-fg hover:bg-danger-tint [&::-webkit-details-marker]:hidden">
        Rejeitar
      </summary>
      <form action={rejectPaymentAction} className="mt-2 space-y-2">
        <input type="hidden" name="paymentId" value={paymentId} />
        <textarea
          name="reason"
          required
          rows={2}
          placeholder="Motivo da rejeição — o cliente vai ver essa mensagem"
          className="w-full rounded-control border border-border bg-page px-3 py-2 text-sm text-fg outline-none focus:border-danger-500 focus:ring-2 focus:ring-danger-500/20"
        />
        <button
          type="submit"
          className="rounded-control bg-danger-500 px-4 py-2 text-sm font-medium text-white hover:bg-danger-700"
        >
          Confirmar rejeição
        </button>
      </form>
    </details>
  );
}
