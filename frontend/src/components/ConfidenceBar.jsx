/**
 * ConfidenceBar — subtle visual indicator of answer confidence.
 * Shown only on agent messages, never as a raw float.
 */
export default function ConfidenceBar({ score }) {
  const pct = Math.round(score * 100);

  // Color based on confidence level
  const barColor =
    pct >= 70
      ? "bg-emerald-500"
      : pct >= 40
      ? "bg-amber-500"
      : "bg-rose-500";

  const label =
    pct >= 70 ? "High confidence" : pct >= 40 ? "Moderate confidence" : "Low confidence";

  return (
    <div className="mt-2.5 flex items-center gap-2.5">
      <div className="flex-1 h-1 rounded-full bg-surface-600 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-surface-500 whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}
