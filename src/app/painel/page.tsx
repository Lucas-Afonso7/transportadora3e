import { requireClientSession } from "@/lib/auth/session";

export default async function PainelPage() {
  const client = await requireClientSession();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink-900">
        Bem-vindo, {client.name.split(" ")[0]}
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        A lista de serviços e pagamentos entra na próxima etapa.
      </p>
    </div>
  );
}
