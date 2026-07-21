import Link from "next/link";
import type { ReactNode } from "react";

export type CardTone = "default" | "brand" | "warning" | "danger" | "info";

// Único componente de card do app. Borda superior de 2px na cor do tone
// (em vez de sombra pesada) é a assinatura visual — como o carimbo de um
// recibo, não um cartão flutuante de dashboard genérico. `tone` também
// tinge o fundo, igual os banners/badges já fazem em outras telas.
const TONE_BG: Record<CardTone, string> = {
  default: "bg-surface",
  brand: "bg-brand-tint",
  warning: "bg-warning-tint",
  danger: "bg-danger-tint",
  info: "bg-info-tint",
};

const TONE_TOP_BORDER: Record<CardTone, string> = {
  default: "border-t-border-muted",
  brand: "border-t-brand-500",
  warning: "border-t-warning-500",
  danger: "border-t-danger-500",
  info: "border-t-info-500",
};

const PADDING = {
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export function Card({
  tone = "default",
  padding = "md",
  href,
  className = "",
  children,
}: {
  tone?: CardTone;
  padding?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  children: ReactNode;
}) {
  const classes = `rounded-card border border-border border-t-2 ${TONE_TOP_BORDER[tone]} ${TONE_BG[tone]} ${PADDING[padding]} shadow-card ${className}`;

  if (href) {
    return (
      <Link href={href} className={`block ${classes} transition-shadow hover:shadow-md`}>
        {children}
      </Link>
    );
  }

  return <div className={classes}>{children}</div>;
}
