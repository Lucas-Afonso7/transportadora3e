export function SummaryStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "brand" | "warning";
}) {
  const valueTone =
    tone === "brand"
      ? "text-brand-700"
      : tone === "warning"
        ? "text-warning-700"
        : "text-ink-900";

  return (
    <div className="rounded-card border border-ink-200 bg-white p-4 shadow-card">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
        {label}
      </p>
      <p className={`mt-1.5 text-lg font-semibold ${valueTone}`}>{value}</p>
    </div>
  );
}
