"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteServiceAction } from "@/app/admin/(protegido)/clientes/actions";

export function DeleteServiceButton({ serviceId }: { serviceId: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    if (!window.confirm("Tem certeza que deseja excluir este frete?")) return;

    startTransition(async () => {
      const result = await deleteServiceAction(serviceId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // router.refresh() busca os dados de novo do servidor sem navegar —
      // a lista some da tela sem reload, e as telas de Financeiro/gráficos
      // já pegam o total certo na próxima vez que forem abertas (mesmo
      // revalidatePath usado no resto do app).
      router.refresh();
    });
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-label="Excluir frete"
        title="Excluir frete"
        className="flex h-7 w-7 items-center justify-center rounded-control text-fg-subtle transition-colors hover:bg-danger-tint hover:text-danger-tint-fg disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {error && (
        <p className="max-w-[11rem] text-right text-xs text-danger-500">
          {error}
        </p>
      )}
    </div>
  );
}
