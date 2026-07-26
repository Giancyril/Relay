/**
 * MetricCard — displays a single summary KPI metric in the Admin Dashboard.
 */
export default function MetricCard({ title, value, subtitle, icon, badge, accentColor = "indigo" }) {
  const accentClasses = {
    indigo: "bg-indigo-950/40 border-indigo-800/40 text-indigo-400",
    amber: "bg-amber-950/40 border-amber-800/40 text-amber-400",
    emerald: "bg-emerald-950/40 border-emerald-800/40 text-emerald-400",
    rose: "bg-rose-950/40 border-rose-800/40 text-rose-400",
  }[accentColor] || "bg-surface-800 border-surface-700 text-slate-300";

  return (
    <div className="bg-surface-800 border border-surface-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">
          {title}
        </span>
        {icon && (
          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${accentClasses}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-100 font-mono tracking-tight">
          {value}
        </span>
        {badge && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-700 border border-surface-600 text-surface-300">
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-surface-500 mt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
}
