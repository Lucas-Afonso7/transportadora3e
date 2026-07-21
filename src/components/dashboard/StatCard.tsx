import type { LucideIcon } from "lucide-react";
import { Card, type CardTone } from "@/components/ui/Card";

const TONE_ICON: Record<string, string> = {
  ink: "text-fg-muted",
  danger: "text-danger-500",
  warning: "text-warning-500",
  brand: "text-brand-500",
};

const TONE_CARD: Record<string, CardTone> = {
  ink: "default",
  danger: "danger",
  warning: "warning",
  brand: "brand",
};

export function StatCard({
  href,
  icon: Icon,
  label,
  value,
  tone = "ink",
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  value: number;
  tone?: keyof typeof TONE_ICON;
}) {
  return (
    <Card href={href} tone={TONE_CARD[tone]}>
      <Icon className={`mb-3 h-6 w-6 ${TONE_ICON[tone]}`} strokeWidth={1.75} />
      <p className="text-sm text-fg-muted">{label}</p>
      <p className="mt-0.5 font-display text-2xl text-fg">{value}</p>
    </Card>
  );
}
