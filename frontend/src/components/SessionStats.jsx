import { useMemo } from "react";

/**
 * SessionStats — displays live session analytics pill bar in the header.
 * Computes total turns, escalation count, avg response latency, and confidence average.
 */
export default function SessionStats({ messages }) {
  const stats = useMemo(() => {
    const agentMsgs = messages.filter((m) => m.role === "agent");
    const totalTurns = messages.filter((m) => m.role === "user").length;
    const escalations = agentMsgs.filter((m) => m.escalated).length;

    const latencies = agentMsgs
      .map((m) => m.responseTimeMs)
      .filter((l) => typeof l === "number");
    const avgLatency =
      latencies.length > 0
        ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
        : null;

    const confidences = agentMsgs
      .map((m) => m.confidence_score)
      .filter((c) => typeof c === "number");
    const avgConfidence =
      confidences.length > 0
        ? Math.round((confidences.reduce((a, b) => a + b, 0) / confidences.length) * 100)
        : null;

    return { totalTurns, escalations, avgLatency, avgConfidence };
  }, [messages]);

  if (stats.totalTurns === 0) return null;

  return (
    <div className="hidden md:flex items-center gap-3 bg-surface-900/90 border border-surface-700/80 px-3 py-1 rounded-xl text-[11px] text-surface-400">
      <span className="flex items-center gap-1 font-medium text-slate-300">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
        {stats.totalTurns} {stats.totalTurns === 1 ? "turn" : "turns"}
      </span>

      <span className="w-px h-3 bg-surface-700" />

      {stats.avgLatency !== null && (
        <>
          <span className="font-mono text-emerald-400">⚡ {stats.avgLatency}ms avg</span>
          <span className="w-px h-3 bg-surface-700" />
        </>
      )}

      {stats.avgConfidence !== null && (
        <>
          <span className="font-mono text-sky-400">🎯 {stats.avgConfidence}% conf</span>
          <span className="w-px h-3 bg-surface-700" />
        </>
      )}

      <span className={`font-semibold ${stats.escalations > 0 ? "text-amber-400" : "text-surface-500"}`}>
        {stats.escalations > 0 ? `⚠️ ${stats.escalations} escalated` : "✓ 0 escalations"}
      </span>
    </div>
  );
}
