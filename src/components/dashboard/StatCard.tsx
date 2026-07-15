import Link from "next/link";
import type { LucideIcon } from "lucide-react";

const TONE_STYLES = {
  ink: "text-ink-500",
  danger: "text-danger-500",
  warning: "text-warning-500",
  brand: "text-brand-500",
} as const;

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
  tone?: keyof typeof TONE_STYLES;
}) {
  return (
    <Link
      href={href}
      className="block rounded-card border border-ink-200 bg-white p-4 shadow-card transition-shadow hover:shadow-md"
    >
      <Icon className={`mb-3 h-6 w-6 ${TONE_STYLES[tone]}`} strokeWidth={1.75} />
      <p className="text-sm text-ink-500">{label}</p>
      <p className="mt-0.5 text-2xl font-semibold text-ink-900">{value}</p>
    </Link>
  );
}
