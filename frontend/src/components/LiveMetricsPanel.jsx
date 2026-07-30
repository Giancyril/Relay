import { useState, useEffect, useRef } from "react";

/**
 * AnimatedCounter — smoothly counts up to a target value over a given duration.
 */
function AnimatedCounter({ target, duration = 1200, suffix = "", prefix = "" }) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (target === null || target === undefined) return;
    const start = performance.now();
    const from = 0;
    const to = Number(target);

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return (
    <span className="font-mono font-bold">
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
}

/**
 * LiveMetricsPanel — fetches /system/metrics and displays animated stat cards.
 */
export default function LiveMetricsPanel() {
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = "http://localhost:8000";

  useEffect(() => {
    let mounted = true;

    async function fetchAll() {
      setIsLoading(true);
      try {
        const [metricsRes, healthRes] = await Promise.all([
          fetch(`${API_BASE}/system/metrics`),
          fetch(`${API_BASE}/health`),
        ]);
        if (!metricsRes.ok || !healthRes.ok) throw new Error("Failed to load metrics");
        const metricsData = await metricsRes.json();
        const healthData = await healthRes.json();
        if (mounted) {
          setMetrics(metricsData);
          setHealth(healthData);
          setError(null);
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchAll();

    // Refresh every 30 seconds
    const interval = setInterval(fetchAll, 30_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const CARDS = [
    {
      label: "Indexed Vectors",
      value: metrics?.total_vectors ?? 0,
      icon: "🗄️",
      suffix: "",
      color: "brand",
      desc: "Knowledge base documents",
    },
    {
      label: "Knowledge Docs",
      value: health?.chromadb_doc_count ?? 0,
      icon: "📚",
      suffix: "",
      color: "emerald",
      desc: "Stored document chunks",
    },
    {
      label: "Python Version",
      value: null,
      raw: metrics?.python_version ?? "–",
      icon: "🐍",
      color: "amber",
      desc: "Backend runtime version",
    },
    {
      label: "Environment",
      value: null,
      raw: metrics?.environment ?? health?.environment ?? "–",
      icon: "🌐",
      color: "rose",
      desc: "Current deployment mode",
    },
  ];

  const colorMap = {
    brand: { ring: "ring-brand-500/30", text: "text-brand-300", bg: "bg-brand-900/30", border: "border-brand-700/40" },
    emerald: { ring: "ring-emerald-500/30", text: "text-emerald-300", bg: "bg-emerald-900/30", border: "border-emerald-700/40" },
    amber: { ring: "ring-amber-500/30", text: "text-amber-300", bg: "bg-amber-900/30", border: "border-amber-700/40" },
    rose: { ring: "ring-rose-500/30", text: "text-rose-300", bg: "bg-rose-900/30", border: "border-rose-700/40" },
  };

  return (
    <div className="rounded-2xl border border-surface-700 bg-surface-900/50 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-base">📊</span>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Live System Metrics</h3>
            <p className="text-[11px] text-surface-400">Refreshes every 30s · Backend telemetry</p>
          </div>
        </div>
        {!isLoading && !error && (
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        )}
        {error && (
          <span className="text-[11px] text-rose-400">⚠ Offline</span>
        )}
      </div>

      {/* Stat Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-surface-800 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-xs text-rose-400 bg-rose-950/30 border border-rose-800/30 rounded-xl p-4 text-center">
          {error} — Is the backend running?
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {CARDS.map((card) => {
            const c = colorMap[card.color];
            return (
              <div
                key={card.label}
                className={`rounded-xl border ${c.border} ${c.bg} p-3.5 ring-1 ${c.ring} space-y-1`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{card.icon}</span>
                  <span className={`text-[11px] font-medium uppercase tracking-wider ${c.text}`}>
                    {card.label}
                  </span>
                </div>
                <div className={`text-xl ${c.text}`}>
                  {card.value !== null ? (
                    <AnimatedCounter target={card.value} />
                  ) : (
                    <span className="font-mono font-bold">{card.raw}</span>
                  )}
                </div>
                <p className="text-[10px] text-surface-500">{card.desc}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
