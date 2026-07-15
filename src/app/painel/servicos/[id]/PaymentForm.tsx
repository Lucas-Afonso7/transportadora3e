"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { submitPaymentAction, type PaymentFormState } from "./actions";
import { formatBRL } from "@/lib/format";

type Method = "PIX" | "DINHEIRO";

const initialState: PaymentFormState = { error: null };

export function PaymentForm({
  service,
  businessProfile,
}: {
  service: { id: number; description: string; remainingAmount: string };
  businessProfile: { pixKey: string; whatsappPhone: string };
}) {
  const [state, formAction, isPending] = useActionState(
    submitPaymentAction,
    initialState,
  );
  const [method, setMethod] = useState<Method>("PIX");
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const whatsappLink = `https://wa.me/${businessProfile.whatsappPhone}`;

  async function copyPixKey() {
    try {
      await navigator.clipboard.writeText(businessProfile.pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível (ex.: contexto não-seguro) — a chave já
      // está visível na tela pra copiar manualmente.
    }
  }

  return (
    <div>
      <Link
        href="/painel"
        className="mb-4 inline-block text-sm text-ink-500 hover:text-ink-900"
      >
        ← Voltar
      </Link>

      <div className="rounded-card border border-ink-200 bg-white p-4 shadow-card">
        <p className="text-sm text-ink-500">{service.description}</p>
        <p className="mt-1 text-2xl font-semibold text-ink-900">
          {formatBRL(service.remainingAmount)}
        </p>
        <p className="text-sm text-ink-500">falta pagar</p>
      </div>

      <form action={formAction} className="mt-4 space-y-4">
        <input type="hidden" name="serviceId" value={service.id} />
        <input type="hidden" name="method" value={method} />

        <div>
          <label
            htmlFor="amount"
            className="mb-1.5 block text-sm font-medium text-ink-700"
          >
            Valor que deseja pagar
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            max={service.remainingAmount}
            defaultValue={service.remainingAmount}
            required
            className="w-full rounded-control border border-ink-300 px-3 py-2.5 text-lg text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <p className="mt-1 text-xs text-ink-500">
            Pode ser o valor total ou parcial — até{" "}
            {formatBRL(service.remainingAmount)}.
          </p>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-ink-700">
            Forma de pagamento
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMethod("PIX")}
              className={`rounded-control border px-4 py-2.5 text-sm font-medium transition-colors ${
                method === "PIX"
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-ink-300 text-ink-600 hover:border-ink-400"
              }`}
            >
              Pix
            </button>
            <button
              type="button"
              onClick={() => setMethod("DINHEIRO")}
              className={`rounded-control border px-4 py-2.5 text-sm font-medium transition-colors ${
                method === "DINHEIRO"
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-ink-300 text-ink-600 hover:border-ink-400"
              }`}
            >
              Dinheiro
            </button>
          </div>
        </div>

        {method === "PIX" ? (
          <div className="space-y-3 rounded-card border border-ink-200 bg-ink-50 p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
                Chave Pix
              </p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="break-all text-sm font-medium text-ink-900">
                  {businessProfile.pixKey}
                </span>
                <button
                  type="button"
                  onClick={copyPixKey}
                  className="shrink-0 rounded-control border border-ink-300 bg-white px-2.5 py-1 text-xs font-medium text-ink-700 hover:border-ink-400"
                >
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1.5 py-1">
              <Image
                src="/pix-qrcode-placeholder.png"
                alt="QR Code Pix"
                width={140}
                height={140}
                className="rounded-control border border-ink-200"
              />
              <p className="text-center text-xs text-ink-400">
                QR ilustrativo — use a chave Pix acima para pagar
              </p>
            </div>

            <div>
              <label
                htmlFor="comprovante"
                className="mb-1.5 block text-sm font-medium text-ink-700"
              >
                Anexar comprovante
              </label>
              <input
                id="comprovante"
                name="comprovante"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                required
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                className="block w-full text-sm text-ink-600 file:mr-3 file:rounded-control file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-700"
              />
              {fileName && (
                <p className="mt-1 text-xs text-ink-500">
                  Selecionado: {fileName}
                </p>
              )}
              <p className="mt-1 text-xs text-ink-500">
                Imagem (JPG/PNG/WEBP) ou PDF, até 8MB.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 rounded-card border border-ink-200 bg-ink-50 p-4">
            <p className="text-sm text-ink-700">
              Combine o pagamento em dinheiro direto com a Transportadora 3E
              pelo WhatsApp. Ao confirmar aqui, esse pagamento entra como{" "}
              <strong>aguardando validação</strong> até o recebimento ser
              confirmado.
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-control bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Chamar no WhatsApp
            </a>
          </div>
        )}

        {state.error && (
          <p className="rounded-control bg-danger-50 px-3 py-2 text-sm text-danger-700">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-control bg-brand-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {isPending
            ? "Enviando…"
            : method === "PIX"
              ? "Enviar comprovante"
              : "Confirmar pagamento em dinheiro"}
        </button>
      </form>
    </div>
  );
}
