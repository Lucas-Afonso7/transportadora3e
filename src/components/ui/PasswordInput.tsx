"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Único campo de senha com "olhinho" — usado nos dois logins (cliente e
// admin). Alterna type="password"/"text" só na tela, nunca desliga
// autoComplete nem required: é puramente visual, não muda o que é enviado.
export function PasswordInput({
  id,
  name,
  autoComplete,
}: {
  id: string;
  name: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        required
        className="w-full rounded-control border border-border bg-page px-3 py-2.5 pr-10 text-fg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Esconder senha" : "Mostrar senha"}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-fg-subtle hover:text-fg-muted"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
